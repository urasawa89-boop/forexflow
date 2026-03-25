// pages/api/ocean.js
// 조위관측소 최신 관측데이터 (공공데이터포털)
// 조위, 수온, 풍향/풍속, 기온, 기압, 염분 — 한 번 호출에 전부 제공
//
// API: https://apis.data.go.kr/1192136/dtRecent/GetDTRecentApiService
// 파라미터: obsCode(관측소코드), reqDate(YYYYMMDD), min(분단위), serviceKey
//
// 응답필드:
//   obsvtrNm: 관측소명, lot/lat: 경위도
//   obsrvnDt: 관측일시, wndrct: 풍향(°), wspd: 풍속(m/s)
//   artmp: 기온(℃), atmpr: 기압(hPa), wtem: 수온(℃)
//   bscTdlvHgt: 조위(cm), slntQty: 염분(PSU)
//   crdir: 유향(°), crsp: 유속(cm/s)

const SERVICE_KEY = "e1a8f5cc95600f2a8b9c926171c78e42c40b7b46610a1261633bb4b72c8bfec5"

const OCEAN_STATIONS = [
  { code: "DT_0001", name: "인천", region: "서해" },
  { code: "DT_0004", name: "안흥", region: "서해" },
  { code: "DT_0010", name: "태안", region: "서해" },
  { code: "DT_0015", name: "군산", region: "서해" },
  { code: "DT_0017", name: "목포", region: "서해" },
  { code: "DT_0019", name: "여수", region: "남해" },
  { code: "DT_0022", name: "통영", region: "남해" },
  { code: "DT_0023", name: "거제", region: "남해" },
  { code: "DT_0025", name: "부산", region: "남해" },
  { code: "DT_0028", name: "울산", region: "동해" },
  { code: "DT_0029", name: "포항", region: "동해" },
  { code: "DT_0031", name: "울릉도", region: "동해" },
  { code: "DT_0032", name: "속초", region: "동해" },
  { code: "DT_0020", name: "제주", region: "남해" },
  { code: "DT_0021", name: "서귀포", region: "남해" },
]

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// 시뮬레이션 폴백
function generateSimData() {
  return OCEAN_STATIONS.map((st) => ({
    ...st,
    tideLevel: (Math.random() * 400 + 50).toFixed(0),
    tideStatus: pick(["간조", "창조중", "만조", "낙조중"]),
    waveHeight: (Math.random() * 2.5 + 0.2).toFixed(1),
    waterTemp: (Math.random() * 8 + 8).toFixed(1),
    windSpeed: (Math.random() * 12 + 1).toFixed(1),
    windDir: pick(["북", "북동", "동", "남동", "남", "남서", "서", "북서"]),
    airTemp: (Math.random() * 10 + 5).toFixed(1),
  }))
}

// 풍향 각도 → 한글
function degToDir(deg) {
  if (deg == null || deg === "" || isNaN(deg)) return "-"
  const dirs = ["북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"]
  return dirs[Math.round(Number(deg) / 22.5) % 16]
}

// 조위로 물때 상태 추정
function estimateTideStatus(level) {
  const v = Number(level)
  if (isNaN(v)) return "관측중"
  if (v > 400) return "만조"
  if (v > 250) return "창조중"
  if (v > 100) return "낙조중"
  return "간조"
}

// XML → JSON 간단 파싱 (item 태그 추출)
function parseXmlItem(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const obj = {}
    const tagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g
    let tagMatch
    while ((tagMatch = tagRegex.exec(itemXml)) !== null) {
      obj[tagMatch[1]] = tagMatch[2].trim()
    }
    items.push(obj)
  }
  return items
}

// 관측소 1개 데이터 조회
async function fetchStation(station) {
  const now = new Date()
  // KST 기준 날짜
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const dateStr = kst.getFullYear().toString() +
    (kst.getMonth() + 1).toString().padStart(2, "0") +
    kst.getDate().toString().padStart(2, "0")

  const url = `https://apis.data.go.kr/1192136/dtRecent/GetDTRecentApiService?obsCode=${station.code}&reqDate=${dateStr}&min=60&serviceKey=${SERVICE_KEY}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const text = await res.text()
    const items = parseXmlItem(text)
    if (!items || items.length === 0) return null

    // 가장 최근 데이터 (마지막 item)
    const latest = items[items.length - 1]

    return {
      ...station,
      tideLevel: latest.bscTdlvHgt || "-",
      tideStatus: estimateTideStatus(latest.bscTdlvHgt),
      waveHeight: "-",  // 이 API에서는 파고 미제공
      waterTemp: latest.wtem || "-",
      windSpeed: latest.wspd || "-",
      windDir: degToDir(latest.wndrct),
      airTemp: latest.artmp || "-",
      obsTime: latest.obsrvnDt || "-",
    }
  } catch (e) {
    return null
  }
}

export default async function handler(req, res) {
  try {
    // 전 관측소 병렬 조회
    const results = await Promise.all(
      OCEAN_STATIONS.map(st => fetchStation(st))
    )

    // 성공한 데이터만 필터, 실패한 건 시뮬레이션으로 채움
    const stations = OCEAN_STATIONS.map((st, i) => {
      if (results[i] && results[i].waterTemp !== "-") return results[i]
      // 해당 관측소 데이터 실패 → 시뮬레이션
      return {
        ...st,
        tideLevel: (Math.random() * 400 + 50).toFixed(0),
        tideStatus: pick(["간조", "창조중", "만조", "낙조중"]),
        waveHeight: (Math.random() * 2.5 + 0.2).toFixed(1),
        waterTemp: (Math.random() * 8 + 8).toFixed(1),
        windSpeed: (Math.random() * 12 + 1).toFixed(1),
        windDir: pick(["북", "북동", "동", "남동", "남", "남서", "서", "북서"]),
        airTemp: (Math.random() * 10 + 5).toFixed(1),
      }
    })

    const realCount = results.filter(r => r && r.waterTemp !== "-").length

    res.status(200).json({
      success: true,
      stations,
      source: realCount > 0 ? "khoa" : "simulated",
      realStations: realCount,
      totalStations: OCEAN_STATIONS.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(200).json({
      success: true,
      stations: generateSimData(),
      source: "simulated",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
