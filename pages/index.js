import { useState, useEffect, useCallback, useMemo } from "react"

const CURRENCIES = [
  { code: "USD", name: "미국 달러", symbol: "$", flag: "🇺🇸" },
  { code: "JPY", name: "일본 엔(100)", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", name: "중국 위안", symbol: "¥", flag: "🇨🇳" },
  { code: "EUR", name: "유로", symbol: "€", flag: "🇪🇺" },
]
const FALLBACK = { USD: 1385.5, JPY: 921.0, CNY: 190.3, EUR: 1510.2 }

// Brand Colors
const B = {
  orange: "#E8612D",
  orangeLight: "#F07A4A",
  orangeDim: "rgba(232,97,45,0.12)",
  bg: "#2B3539",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardBorder: "rgba(255,255,255,0.07)",
  text: "#E8E4DF",
  textDim: "rgba(232,228,223,0.45)",
  textDimmer: "rgba(232,228,223,0.25)",
  green: "#4CAF50",
  red: "#EF5350",
  blue: "#42A5F5",
  headerBg: "#242D31",
}

const SEAFOOD_DB = [
  { id: "kim_dried", name: "마른김", hs: "2008.99", tariff: 20, unit: "kg", group: "해조류" },
  { id: "kim_seasoned", name: "조미김", hs: "2008.99", tariff: 20, unit: "kg", group: "해조류" },
  { id: "miyeok", name: "미역", hs: "1212.21", tariff: 20, unit: "kg", group: "해조류" },
  { id: "dashima", name: "다시마", hs: "1212.21", tariff: 20, unit: "kg", group: "해조류" },
  { id: "gonori", name: "고노리", hs: "1212.21", tariff: 20, unit: "kg", group: "해조류" },
  { id: "crab_meat", name: "게살", hs: "1605.10", tariff: 20, unit: "kg", group: "갑각류" },
  { id: "king_crab", name: "킹크랩", hs: "0306.12", tariff: 20, unit: "kg", group: "갑각류" },
  { id: "snow_crab", name: "대게", hs: "0306.14", tariff: 20, unit: "kg", group: "갑각류" },
  { id: "shrimp", name: "새우", hs: "0306.17", tariff: 20, unit: "kg", group: "갑각류" },
  { id: "lobster", name: "랍스터", hs: "0306.11", tariff: 20, unit: "kg", group: "갑각류" },
  { id: "gonjeangi", name: "곤쟁이(젓새우)", hs: "0306.19", tariff: 20, unit: "kg", group: "갑각류" },
  { id: "salmon", name: "연어", hs: "0302.14", tariff: 20, unit: "kg", group: "어류" },
  { id: "tuna", name: "참치", hs: "0302.31", tariff: 20, unit: "kg", group: "어류" },
  { id: "flatfish", name: "넙치(광어)", hs: "0302.24", tariff: 20, unit: "kg", group: "어류" },
  { id: "cod", name: "대구", hs: "0302.51", tariff: 20, unit: "kg", group: "어류" },
  { id: "pollock", name: "명태", hs: "0302.52", tariff: 20, unit: "kg", group: "어류" },
  { id: "mackerel", name: "고등어", hs: "0302.44", tariff: 20, unit: "kg", group: "어류" },
  { id: "herring", name: "청어", hs: "0302.41", tariff: 20, unit: "kg", group: "어류" },
  { id: "anchovy", name: "멸치", hs: "0302.42", tariff: 20, unit: "kg", group: "어류" },
  { id: "sardine", name: "정어리", hs: "0302.43", tariff: 20, unit: "kg", group: "어류" },
  { id: "horse_mackerel", name: "전갱이(메가리)", hs: "0302.49", tariff: 20, unit: "kg", group: "어류" },
  { id: "monkfish", name: "아귀", hs: "0302.89", tariff: 20, unit: "kg", group: "어류" },
  { id: "silchi", name: "실치(뱅어)", hs: "0302.89", tariff: 20, unit: "kg", group: "어류" },
  { id: "kanari", name: "까나리(양미리)", hs: "0302.89", tariff: 20, unit: "kg", group: "어류" },
  { id: "squid", name: "오징어", hs: "0307.42", tariff: 10, unit: "kg", group: "연체류" },
  { id: "octopus", name: "문어", hs: "0307.52", tariff: 20, unit: "kg", group: "연체류" },
  { id: "oyster", name: "굴", hs: "0307.11", tariff: 0, unit: "kg", group: "패류" },
  { id: "abalone", name: "전복", hs: "0307.81", tariff: 20, unit: "kg", group: "패류" },
  { id: "scallop", name: "가리비(관자)", hs: "0307.21", tariff: 20, unit: "kg", group: "패류" },
  { id: "sea_cucumber", name: "해삼", hs: "0308.11", tariff: 20, unit: "kg", group: "기타" },
  { id: "fish_roe", name: "어란(명란)", hs: "0305.20", tariff: 20, unit: "kg", group: "가공품" },
  { id: "canned_tuna", name: "참치캔", hs: "1604.14", tariff: 20, unit: "box", group: "가공품" },
  { id: "other", name: "기타 수산물", hs: "-", tariff: 0, unit: "kg", group: "기타" },
]
const GROUPS = ["전체", "어류", "갑각류", "연체류", "패류", "해조류", "가공품", "기타"]

const OCEAN_STATIONS = [
  { code: "DT_0001", name: "인천", region: "서해" },
  { code: "DT_0010", name: "태안", region: "서해" },
  { code: "DT_0015", name: "군산", region: "서해" },
  { code: "DT_0017", name: "목포", region: "서해" },
  { code: "DT_0019", name: "여수", region: "남해" },
  { code: "DT_0022", name: "통영", region: "남해" },
  { code: "DT_0025", name: "부산", region: "남해" },
  { code: "DT_0028", name: "울산", region: "동해" },
  { code: "DT_0029", name: "포항", region: "동해" },
  { code: "DT_0032", name: "속초", region: "동해" },
  { code: "DT_0020", name: "제주", region: "남해" },
]

function genOceanData() {
  return OCEAN_STATIONS.map(st => ({ ...st, tideLevel: (Math.random() * 400 + 50).toFixed(0), tideStatus: ["간조", "창조중", "만조", "낙조중"][Math.floor(Math.random() * 4)], waveHeight: (Math.random() * 2.5 + 0.2).toFixed(1), waterTemp: (Math.random() * 8 + 8).toFixed(1), windSpeed: (Math.random() * 12 + 1).toFixed(1), windDir: ["북", "북동", "동", "남동", "남", "남서", "서", "북서"][Math.floor(Math.random() * 8)], airTemp: (Math.random() * 10 + 5).toFixed(1) }))
}

function fmtKRW(n) { return "₩" + Math.round(n || 0).toLocaleString("ko-KR") }
function toKRW(a, c, r) { return c === "JPY" ? (a / 100) * r : a * r }
function dispRate(c, r) { return c === "JPY" ? (r / 100).toFixed(2) + "원/1엔" : r.toFixed(2) + "원" }
function getProd(id) { return SEAFOOD_DB.find(p => p.id === id) || SEAFOOD_DB[SEAFOOD_DB.length - 1] }

function Spark({ data, color, w = 76, h = 26 }) {
  if (!data || data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ")
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function Ad({ pos }) {
  return <div style={{ background: B.bgCard, border: `1px dashed ${B.bgCardBorder}`, borderRadius: 10, padding: "12px 20px", textAlign: "center", color: B.textDimmer, fontSize: 11, letterSpacing: 1, marginBottom: pos === "top" ? 16 : 0, marginTop: pos === "bottom" ? 16 : 0 }}>
    AD · Google AdSense / 카카오 애드핏
  </div>
}

export default function Home() {
  const [tab, setTab] = useState("dashboard")
  const [rates, setRates] = useState(FALLBACK)
  const [detailed, setDetailed] = useState({})
  const [hist, setHist] = useState({ USD: [], JPY: [], CNY: [], EUR: [] })
  const [src, setSrc] = useState("loading")
  const [upd, setUpd] = useState(null)
  const [alertM, setAlertM] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [toast, setToast] = useState("")
  const [oceanData, setOceanData] = useState([])
  const [oceanUpd, setOceanUpd] = useState(null)
  const [oceanRegion, setOceanRegion] = useState("전체")
  const [rateView, setRateView] = useState("card")

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/rates"); const data = await res.json()
      if (data.success && Object.keys(data.rates).length > 0) {
        const nr = { ...FALLBACK, ...data.rates }; setRates(nr)
        if (data.detailed) setDetailed(data.detailed)
        setHist(p => { const h = {}; Object.keys(nr).forEach(k => { h[k] = [...(p[k] || []).slice(-13), nr[k]] }); return h })
        setSrc("live"); setUpd(new Date()); return
      }
      throw new Error("empty")
    } catch {
      setRates(p => { const nr = {}; Object.keys(p).forEach(k => { nr[k] = Math.round((p[k] + (Math.random() - 0.5) * (k === "JPY" ? 3 : k === "CNY" ? 1 : 4)) * 100) / 100 }); return nr })
      setHist(p => { const h = {}; Object.keys(FALLBACK).forEach(k => { h[k] = [...(p[k] || []).slice(-13), rates[k]] }); return h })
      setSrc("sim"); setUpd(new Date())
    }
  }, [rates])

  const fetchOcean = useCallback(async () => {
    try { const res = await fetch("/api/ocean"); const data = await res.json(); if (data.success && data.stations) { setOceanData(data.stations); setOceanUpd(new Date()); return } throw new Error("fb") } catch { setOceanData(genOceanData()); setOceanUpd(new Date()) }
  }, [])

  useEffect(() => { fetchRates(); fetchOcean() }, [])
  useEffect(() => { const iv = setInterval(fetchRates, 60000); return () => clearInterval(iv) }, [fetchRates])
  useEffect(() => { const iv = setInterval(fetchOcean, 300000); return () => clearInterval(iv) }, [fetchOcean])

  const S = {
    app: { fontFamily: "'Pretendard',sans-serif", background: B.bg, color: B.text, minHeight: "100vh", fontSize: 14 },
    hdr: { background: B.headerBg, borderBottom: `1px solid ${B.bgCardBorder}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, flexWrap: "wrap", gap: 8 },
    nav: { display: "flex", gap: 2, flexWrap: "wrap" },
    nb: (a) => ({ padding: "7px 14px", borderRadius: 7, border: "none", background: a ? B.orangeDim : "transparent", color: a ? B.orange : B.textDim, fontWeight: a ? 600 : 400, fontSize: 12.5, cursor: "pointer" }),
    mn: { maxWidth: 1160, margin: "0 auto", padding: "16px 20px" },
    c: { background: B.bgCard, border: `1px solid ${B.bgCardBorder}`, borderRadius: 11, padding: 15 },
    ct: { fontSize: 10, color: B.textDimmer, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, fontWeight: 500 },
    cv: { fontSize: 19, fontWeight: 700 },
    btn: { padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${B.orange},${B.orangeLight})`, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" },
    bo: (a) => ({ padding: "6px 12px", borderRadius: 7, border: `1px solid ${a ? "rgba(232,97,45,0.3)" : B.bgCardBorder}`, background: a ? B.orangeDim : "transparent", color: a ? B.orange : B.textDim, fontSize: 11.5, cursor: "pointer", fontWeight: a ? 600 : 400 }),
    mod: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    mc: { background: "#1E2629", border: `1px solid ${B.bgCardBorder}`, borderRadius: 14, padding: 24, width: 400, maxHeight: "85vh", overflowY: "auto" },
    inp: { width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${B.bgCardBorder}`, background: "rgba(255,255,255,0.03)", color: B.text, fontSize: 13, outline: "none", boxSizing: "border-box" },
    sel: { width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${B.bgCardBorder}`, background: "rgba(255,255,255,0.03)", color: B.text, fontSize: 13, outline: "none", boxSizing: "border-box" },
    lb: { display: "block", fontSize: 11, color: B.textDim, marginBottom: 4, fontWeight: 500 },
    th: { textAlign: "left", padding: "8px 10px", fontSize: 10, color: B.textDimmer, textTransform: "uppercase", letterSpacing: 0.7 },
    td: { padding: "9px 10px", background: "rgba(255,255,255,0.015)", fontSize: 12 },
    secT: { fontSize: 14, fontWeight: 700, marginBottom: 12 },
    tag: { display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 10, background: B.orangeDim, color: B.orange, marginLeft: 4 },
  }

  // Import Cost Calculator
  function ImportCalc() {
    const [p, sP] = useState("shrimp"); const [cur, sCur] = useState("JPY"); const [amt, sAmt] = useState("5000000"); const [qty, sQty] = useState("3000")
    const prod = getProd(p); const krw = amt ? toKRW(Number(amt), cur, rates[cur] || 0) : 0
    const tariffAmt = krw * (prod.tariff / 100); const vat = (krw + tariffAmt) * 0.1; const total = krw + tariffAmt + vat
    const unitKRW = qty && Number(qty) > 0 ? total / Number(qty) : 0
    return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div>
        <div style={{ marginBottom: 8 }}><label style={S.lb}>품목</label><select style={S.sel} value={p} onChange={e => sP(e.target.value)}>{SEAFOOD_DB.filter(x => x.hs !== "-").map(x => <option key={x.id} value={x.id}>{x.name} (HS:{x.hs} · 관세{x.tariff}%)</option>)}</select></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div><label style={S.lb}>통화</label><select style={S.sel} value={cur} onChange={e => sCur(e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
          <div><label style={S.lb}>수입금액 (외화)</label><input type="number" style={S.inp} value={amt} onChange={e => sAmt(e.target.value)} /></div>
        </div>
        <div><label style={S.lb}>수량 ({prod.unit})</label><input type="number" style={S.inp} value={qty} onChange={e => sQty(e.target.value)} /></div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 9, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: B.textDim }}>수입 비용 내역 {src === "live" ? "🟢" : "🟡"}</div>
        {[["물품가격 (CIF)", fmtKRW(krw), null], [`관세 (${prod.tariff}%)`, "+ " + fmtKRW(tariffAmt), B.orange], ["부가세 (10%)", "+ " + fmtKRW(vat), B.orange]].map(([l, v, c], i) =>
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: `1px solid ${B.bgCardBorder}` }}><span style={{ color: B.textDim }}>{l}</span><span style={{ color: c || "inherit" }}>{v}</span></div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 4px", fontSize: 14, fontWeight: 700 }}><span>총 수입원가</span><span style={{ color: B.orange }}>{fmtKRW(total)}</span></div>
        <div style={{ background: B.orangeDim, borderRadius: 6, padding: "6px 10px", marginTop: 6, textAlign: "center" }}>
          <span style={{ fontSize: 11, color: B.textDim }}>{prod.unit}당 원가: </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: B.orange }}>{fmtKRW(unitKRW)}</span>
        </div>
      </div>
    </div>
  }

  // Dashboard
  const Dash = () => <div>
    <Ad pos="top" />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={S.secT}>수출입 환율</div>
      <div style={{ display: "flex", gap: 4 }}>
        <button style={S.bo(rateView === "card")} onClick={() => setRateView("card")}>카드</button>
        <button style={S.bo(rateView === "table")} onClick={() => setRateView("table")}>표</button>
      </div>
    </div>
    {rateView === "card" ? (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
      {CURRENCIES.map(c => {
        const h2 = hist[c.code] || []; const prev = h2.length >= 2 ? h2[h2.length - 2] : rates[c.code]; const d = rates[c.code] - prev; const p = prev ? ((d / prev) * 100).toFixed(2) : "0"; const up = d >= 0; const det = detailed[c.code]
        return <div key={c.code} style={S.c}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div><div style={{ fontSize: 10.5, color: B.textDimmer, marginBottom: 2 }}>{c.flag} {c.code}</div><div style={{ fontSize: 17, fontWeight: 700 }}>{rates[c.code]}<span style={{ fontSize: 10, color: B.textDimmer }}>원</span></div><div style={{ fontSize: 10, color: up ? B.green : B.red }}>{up ? "▲" : "▼"} {Math.abs(d).toFixed(2)} ({up ? "+" : ""}{p}%)</div></div>
            <Spark data={h2.length > 1 ? h2 : [rates[c.code], rates[c.code]]} color={up ? B.green : B.red} />
          </div>
          <div style={{ borderTop: `1px solid ${B.bgCardBorder}`, paddingTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}><span style={{ color: B.textDim }}>매매기준율</span><span style={{ fontWeight: 600 }}>{det?.base || rates[c.code]}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}><span style={{ color: B.orange }}>송금보낼때 <span style={{ fontSize: 9, opacity: 0.7 }}>(TTS·수입)</span></span><span style={{ fontWeight: 600, color: B.orange }}>{det?.tts || "-"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}><span style={{ color: B.green }}>송금받을때 <span style={{ fontSize: 9, opacity: 0.7 }}>(TTB·수출)</span></span><span style={{ fontWeight: 600, color: B.green }}>{det?.ttb || "-"}</span></div>
          </div>
        </div>
      })}
    </div>
    ) : (
    <div style={{ ...S.c, marginBottom: 14, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
        <thead><tr><th style={S.th}>통화</th><th style={S.th}>매매기준율</th><th style={{ ...S.th, color: B.orange }}>전신환매도(TTS) 수입·송금</th><th style={{ ...S.th, color: B.green }}>전신환매입(TTB) 수출·입금</th><th style={S.th}>스프레드</th><th style={S.th}>등락</th></tr></thead>
        <tbody>{CURRENCIES.map(c => {
          const det = detailed[c.code]; const h2 = hist[c.code] || []; const prev = h2.length >= 2 ? h2[h2.length - 2] : rates[c.code]; const d = rates[c.code] - prev; const up = d >= 0
          const spread = det?.tts && det?.ttb ? (det.tts - det.ttb).toFixed(2) : "-"
          return <tr key={c.code}><td style={{ ...S.td, borderRadius: "6px 0 0 6px", fontWeight: 600 }}>{c.flag} {c.code} <span style={{ fontWeight: 400, color: B.textDimmer, fontSize: 11 }}>{c.name}</span></td><td style={{ ...S.td, fontWeight: 700, fontSize: 14 }}>{det?.base || rates[c.code]}</td><td style={{ ...S.td, color: B.orange, fontWeight: 600 }}>{det?.tts || "-"}</td><td style={{ ...S.td, color: B.green, fontWeight: 600 }}>{det?.ttb || "-"}</td><td style={{ ...S.td, color: B.textDimmer }}>{spread}</td><td style={{ ...S.td, borderRadius: "0 6px 6px 0", color: up ? B.green : B.red, fontWeight: 600 }}>{up ? "▲" : "▼"} {Math.abs(d).toFixed(2)}</td></tr>
        })}</tbody>
      </table>
      <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 7, fontSize: 10.5, color: B.textDimmer }}>
        TTS(전신환매도율) = 수입대금 송금 시 · TTB(전신환매입율) = 수출대금 입금 시
      </div>
    </div>
    )}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 10.5 }}>
      <span style={{ color: B.textDimmer }}>{src === "live" ? "● 한국수출입은행 실시간" : "● 시뮬레이션"}{upd && ` · ${upd.toLocaleTimeString("ko-KR")}`}</span>
      <div style={{ display: "flex", gap: 6 }}><button style={S.bo(false)} onClick={() => setAlertM(true)}>환율알림</button><button style={S.bo(false)} onClick={fetchRates}>새로고침</button></div>
    </div>

    {/* Import Simulator */}
    <div style={{ ...S.c, marginBottom: 16 }}><div style={S.secT}>수입 비용 시뮬레이터</div><ImportCalc /></div>

    {/* HS Code Quick Lookup */}
    <div style={{ ...S.c, marginBottom: 16 }}>
      <div style={S.secT}>주요 수산물 HS코드 · 관세율</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {SEAFOOD_DB.filter(p => p.hs !== "-").slice(0, 16).map(p =>
          <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px", border: `1px solid ${B.bgCardBorder}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{p.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
              <code style={{ color: B.orange }}>{p.hs}</code>
              <span style={{ color: p.tariff > 15 ? B.orange : B.green, fontWeight: 600 }}>{p.tariff}%</span>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Ocean Preview */}
    {oceanData.length > 0 && <div style={{ ...S.c, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={S.secT}>실시간 해양정보</div><button style={S.bo(false)} onClick={() => setTab("ocean")}>전체보기 →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
        {oceanData.slice(0, 5).map(st => <div key={st.code} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px", border: `1px solid ${B.bgCardBorder}`, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{st.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: Number(st.waveHeight) > 1.5 ? B.red : B.blue }}>{st.waveHeight}m</div>
          <div style={{ fontSize: 10, color: B.textDim }}>수온 {st.waterTemp}℃</div>
        </div>)}
      </div>
    </div>}

    {/* News Section */}
    <div style={{ ...S.c, marginTop: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={S.secT}>수산물 수출입 뉴스</div><a href="/news" style={{ fontSize: 11, color: B.orange, textDecoration: "none" }}>전체보기 →</a>
      </div>
      {[
        { source: "해양수산부", title: "2026년 수산식품 수출 목표 35억 달러… 김·참치·굴 집중 육성", date: "2026-03-24", tag: "정책", color: B.blue },
        { source: "수입식품정보마루", title: "일본산 수입식품 방사능검사 결과 (3.13~3.19) — 전량 적합", date: "2026-03-20", tag: "검역", color: B.red },
        { source: "FTA 포털", title: "RCEP 4년차 관세인하 적용… 일본산 수산물 세율 변동 안내", date: "2026-03-18", tag: "FTA", color: B.green },
        { source: "국립수산물품질관리원", title: "중국산 냉동 오징어 잔류약물 기준 초과 — 수입금지 조치", date: "2026-03-16", tag: "검역", color: B.red },
        { source: "한국수산무역협회", title: "냉동새우 수입량 전년 대비 12% 증가… 동남아산 비중 확대", date: "2026-03-12", tag: "통계", color: "#bb86fc" },
      ].map((n, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${B.bgCardBorder}` : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: n.color, background: `${n.color}18`, padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{n.tag}</span>
          <span style={{ fontSize: 12, fontWeight: 500 }}>{n.title}</span>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 10, color: B.textDimmer }}>{n.date}</div>
          <div style={{ fontSize: 9.5, color: B.textDimmer }}>{n.source}</div>
        </div>
      </div>)}
    </div>
    <Ad pos="bottom" />
  </div>

  // Products Tab
  const ProdTab = () => {
    const [grp, setGrp] = useState("전체"); const [search, setSearch] = useState("")
    const filtered = SEAFOOD_DB.filter(p => { if (grp !== "전체" && p.group !== grp) return false; if (search && !p.name.includes(search) && !p.hs.includes(search)) return false; return true })
    return <div>
      <div style={S.secT}>수산물 HS코드 · 관세율표</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{GROUPS.map(g => <button key={g} style={S.bo(grp === g)} onClick={() => setGrp(g)}>{g}</button>)}</div>
        <input style={{ ...S.inp, width: 200 }} placeholder="품목명 또는 HS코드 검색" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ ...S.c, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
          <thead><tr><th style={S.th}>품목</th><th style={S.th}>HS코드</th><th style={S.th}>기본관세</th><th style={S.th}>단위</th><th style={S.th}>그룹</th></tr></thead>
          <tbody>{filtered.map(p => <tr key={p.id}>
            <td style={{ ...S.td, borderRadius: "6px 0 0 6px", fontWeight: 600 }}>{p.name}</td>
            <td style={S.td}><code style={{ background: B.orangeDim, color: B.orange, padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{p.hs}</code></td>
            <td style={S.td}><span style={{ color: p.tariff > 15 ? B.orange : B.green, fontWeight: 600 }}>{p.tariff}%</span></td>
            <td style={{ ...S.td, color: B.textDim }}>{p.unit}</td>
            <td style={{ ...S.td, borderRadius: "0 6px 6px 0" }}><span style={S.tag}>{p.group}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ ...S.c, marginTop: 16 }}><div style={S.secT}>수입 비용 시뮬레이터</div><ImportCalc /></div>
    </div>
  }

  // Ocean Tab
  const OceanTab = () => {
    const regions = ["전체", "서해", "남해", "동해"]
    const filtered = oceanRegion === "전체" ? oceanData : oceanData.filter(s => s.region === oceanRegion)
    const getWC = (h) => { const v = Number(h); if (v >= 2) return B.red; if (v >= 1.5) return B.orange; if (v >= 1) return "#ffd666"; return B.green }
    const getWL = (h) => { const v = Number(h); if (v >= 2) return "높음"; if (v >= 1.5) return "약간높음"; if (v >= 1) return "보통"; return "잔잔" }
    return <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={S.secT}>전국 실시간 해양정보</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10.5, color: B.textDimmer }}>{oceanUpd ? `${oceanUpd.toLocaleTimeString("ko-KR")}` : "..."} · 5분 갱신</span>
          <button style={S.bo(false)} onClick={fetchOcean}>새로고침</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>{regions.map(r => <button key={r} style={S.bo(oceanRegion === r)} onClick={() => setOceanRegion(r)}>{r}</button>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {filtered.map(st => <div key={st.code} style={S.c}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{st.name}<span style={S.tag}>{st.region}</span></span>
            <span style={{ fontSize: 10, color: B.textDimmer }}>{st.tideStatus}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 7, padding: "6px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, color: B.textDimmer, marginBottom: 2 }}>파고</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: getWC(st.waveHeight) }}>{st.waveHeight}m</div>
              <div style={{ fontSize: 9, color: getWC(st.waveHeight) }}>{getWL(st.waveHeight)}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 7, padding: "6px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, color: B.textDimmer, marginBottom: 2 }}>수온</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: B.blue }}>{st.waterTemp}℃</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 7, padding: "6px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, color: B.textDimmer, marginBottom: 2 }}>바람</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{st.windSpeed}m/s</div>
              <div style={{ fontSize: 9, color: B.textDimmer }}>{st.windDir}풍</div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  }

  // Calculator
  const CalcTab = () => {
    const [c, sC] = useState("JPY"); const [a, sA] = useState("1000000")
    const kr = a ? toKRW(Number(a), c, rates[c] || 0) : 0
    return <div style={{ ...S.c, maxWidth: 440 }}>
      <div style={S.secT}>환율 계산기</div>
      <div style={{ marginBottom: 10 }}><label style={S.lb}>통화</label><select style={S.sel} value={c} onChange={e => sC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.flag} {x.code} - {x.name}</option>)}</select></div>
      <div style={{ marginBottom: 12 }}><label style={S.lb}>외화 금액</label><input type="number" style={{ ...S.inp, fontSize: 17, fontWeight: 700, padding: "11px 13px" }} value={a} onChange={e => sA(e.target.value)} /></div>
      <div style={{ background: B.orangeDim, borderRadius: 10, padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: B.textDim, marginBottom: 4 }}>적용: {dispRate(c, rates[c] || 0)} {src === "live" ? "●" : "○"}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: B.orange }}>{fmtKRW(kr)}</div>
      </div>
    </div>
  }

  // Alert Modal
  const AlertMod = () => {
    const [f, sF] = useState({ currency: "JPY", cond: "below", target: "" })
    return <div style={S.mod} onClick={() => setAlertM(false)}><div style={S.mc} onClick={e => e.stopPropagation()}>
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>환율 알림</h3>
      <div style={{ marginBottom: 8 }}><label style={S.lb}>통화</label><select style={S.sel} value={f.currency} onChange={e => sF({ ...f, currency: e.target.value })}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div><label style={S.lb}>조건</label><select style={S.sel} value={f.cond} onChange={e => sF({ ...f, cond: e.target.value })}><option value="below">이하</option><option value="above">이상</option></select></div>
        <div><label style={S.lb}>목표(원)</label><input type="number" style={S.inp} value={f.target} onChange={e => sF({ ...f, target: e.target.value })} /></div>
      </div>
      <button style={{ ...S.btn, width: "100%" }} onClick={() => { if (f.target) { setAlerts([...alerts, { ...f, id: Date.now(), target: Number(f.target) }]); setAlertM(false) } }}>등록</button>
      {alerts.length > 0 && <div style={{ marginTop: 12 }}>{alerts.map(a => <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${B.bgCardBorder}`, fontSize: 11.5 }}>
        <span>{CURRENCIES.find(c => c.code === a.currency)?.flag} {a.currency} {a.target}원 {a.cond === "below" ? "↓" : "↑"}</span>
        <button onClick={() => setAlerts(alerts.filter(x => x.id !== a.id))} style={{ background: "none", border: "none", color: B.red, cursor: "pointer", fontSize: 11 }}>삭제</button>
      </div>)}</div>}
    </div></div>
  }

  return <div style={S.app}>
    <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
    <header style={S.hdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/logo.png" alt="Bay Works" style={{ height: 100, width: "auto" }} />
      </div>
      <nav style={S.nav}>
        {[["dashboard", "대시보드"], ["products", "품목·관세"], ["ocean", "해양정보"], ["calculator", "계산기"]].map(([k, l]) =>
          <button key={k} style={S.nb(tab === k)} onClick={() => setTab(k)}>{l}</button>
        )}
        <a href="/docs" style={{ padding: "7px 14px", borderRadius: 7, color: B.textDim, fontSize: 12.5, textDecoration: "none" }}>수입서류</a>
        <a href="/tools" style={{ padding: "7px 14px", borderRadius: 7, color: B.textDim, fontSize: 12.5, textDecoration: "none" }}>수입도구</a>
      </nav>
    </header>
    <main style={S.mn}>
      {tab === "dashboard" && <Dash />}
      {tab === "products" && <ProdTab />}
      {tab === "ocean" && <OceanTab />}
      {tab === "calculator" && <CalcTab />}
    </main>
    {alertM && <AlertMod />}
    {toast && <div style={{ position: "fixed", bottom: 20, right: 20, background: B.orange, color: "#fff", padding: "9px 18px", borderRadius: 9, fontWeight: 600, fontSize: 12.5, zIndex: 2000 }}>{toast}</div>}
  </div>
}
