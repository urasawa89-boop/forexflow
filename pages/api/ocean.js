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

function generateStationData() {
  return OCEAN_STATIONS.map((station) => ({
    ...station,
    tideLevel: (Math.random() * 400 + 50).toFixed(0),
    tideStatus: pick(["간조", "창조중", "만조", "낙조중"]),
    waveHeight: (Math.random() * 2.5 + 0.2).toFixed(1),
    waterTemp: (Math.random() * 8 + 8).toFixed(1),
    windSpeed: (Math.random() * 12 + 1).toFixed(1),
    windDir: pick(["북", "북동", "동", "남동", "남", "남서", "서", "북서"]),
    airTemp: (Math.random() * 10 + 5).toFixed(1),
  }))
}

export default async function handler(req, res) {
  res.status(200).json({
    success: true,
    stations: generateStationData(),
    source: "simulated",
    timestamp: new Date().toISOString(),
  })
}
