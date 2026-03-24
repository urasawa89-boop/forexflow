import { useState, useEffect, useCallback, useMemo } from "react"

const CURRENCIES = [
  { code: "USD", name: "미국 달러", symbol: "$", flag: "🇺🇸" },
  { code: "JPY", name: "일본 엔(100)", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", name: "중국 위안", symbol: "¥", flag: "🇨🇳" },
  { code: "EUR", name: "유로", symbol: "€", flag: "🇪🇺" },
]

const FALLBACK = { USD: 1385.5, JPY: 921.0, CNY: 190.3, EUR: 1510.2 }

const SAMPLES = [
  { id: 1, date: "2026-03-20", type: "income", currency: "JPY", foreignAmount: 5000000, krwAmount: 46050000, rate: 921.0, partner: "마루하니치로", memo: "참치 수출대금", category: "수출" },
  { id: 2, date: "2026-03-18", type: "expense", currency: "USD", foreignAmount: 32000, krwAmount: 44336000, rate: 1385.5, partner: "Pacific Seafood", memo: "연어 수입대금", category: "수입" },
  { id: 3, date: "2026-03-15", type: "income", currency: "CNY", foreignAmount: 280000, krwAmount: 53284000, rate: 190.3, partner: "大连海产", memo: "게살 수출대금", category: "수출" },
  { id: 4, date: "2026-03-12", type: "expense", currency: "JPY", foreignAmount: 8500000, krwAmount: 78285000, rate: 921.0, partner: "닛스이", memo: "새우 수입대금", category: "수입" },
  { id: 5, date: "2026-03-10", type: "income", currency: "USD", foreignAmount: 18500, krwAmount: 25631750, rate: 1385.5, partner: "Alaska Fish Co.", memo: "대게 수출대금", category: "수출" },
  { id: 6, date: "2026-03-08", type: "expense", currency: "CNY", foreignAmount: 150000, krwAmount: 28545000, rate: 190.3, partner: "青岛水产", memo: "오징어 수입대금", category: "수입" },
]

function fmtKRW(n) { return "₩" + Math.round(n || 0).toLocaleString("ko-KR") }
function fmtF(a, c) { return c === "JPY" ? "¥" + Math.round(a).toLocaleString() : (CURRENCIES.find(x => x.code === c)?.symbol || "") + Number(a).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function toKRW(a, c, r) { return c === "JPY" ? (a / 100) * r : a * r }
function dispRate(c, r) { return c === "JPY" ? (r / 100).toFixed(2) + "원/1엔" : r.toFixed(2) + "원" }
function today() { return new Date().toISOString().split("T")[0] }

function exportCSV(txs, rates) {
  const BOM = "\uFEFF"
  const h = "거래일,유형,카테고리,거래처,통화,외화금액,적용환율,원화금액,메모\n"
  const rows = txs.map(t => `${t.date},${t.type === "income" ? "입금" : "출금"},${t.category},${t.partner},${t.currency},${t.foreignAmount},${t.rate},${Math.round(t.krwAmount)},${t.memo}`).join("\n")
  const sum = "\n\n=== 현재 환율 ===\n통화,환율(원)\n" + CURRENCIES.map(c => `${c.code},${rates[c.code] || "N/A"}`).join("\n")
  const blob = new Blob([BOM + h + rows + sum], { type: "text/csv;charset=utf-8;" })
  const u = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = u; a.download = `ForexFlow_${today()}.csv`; a.click()
  URL.revokeObjectURL(u)
}

function Spark({ data, color, w = 76, h = 26 }) {
  if (!data || data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ")
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function Ad({ pos }) {
  return <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 1, marginBottom: pos === "top" ? 16 : 0, marginTop: pos === "bottom" ? 16 : 0 }}>
    AD · {pos === "top" ? "728×90" : "728×90"} · Google AdSense / 카카오 애드핏
  </div>
}

export default function Home() {
  const [tab, setTab] = useState("dashboard")
  const [txs, setTxs] = useState(SAMPLES)
  const [rates, setRates] = useState(FALLBACK)
  const [hist, setHist] = useState({ USD: [], JPY: [], CNY: [], EUR: [] })
  const [src, setSrc] = useState("loading")
  const [upd, setUpd] = useState(null)
  const [addM, setAddM] = useState(false)
  const [alertM, setAlertM] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [toast, setToast] = useState("")

  // ── 한국수출입은행 API ──
  // 배포 후 아래 API_KEY를 본인 키로 교체
  // 발급: https://www.koreaexim.go.kr → 오픈API → 무료 인증키 신청
  const fetchRates = useCallback(async () => {
    try {
      const API_KEY = "9JiEUpxYu1XixUnXg8ku7Vi79i20btcF"
      const d = today().replace(/-/g, "")
      const url = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${d}&data=AP01`
      const res = await fetch(url)
      if (!res.ok) throw new Error("err")
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const nr = { ...FALLBACK }
        const map = { "USD": "USD", "JPY(100)": "JPY", "CNH": "CNY", "EUR": "EUR" }
        data.forEach(it => { const m = map[it.cur_unit]; if (m) { const v = parseFloat(it.deal_bas_r?.replace(/,/g, "")); if (!isNaN(v)) nr[m] = v } })
        setRates(nr)
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

  useEffect(() => { fetchRates() }, [])
  useEffect(() => { const iv = setInterval(fetchRates, 60000); return () => clearInterval(iv) }, [fetchRates])

  useEffect(() => { try { const s = localStorage.getItem("fxflow"); if (s) setTxs(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem("fxflow", JSON.stringify(txs)) } catch {} }, [txs])

  const stats = useMemo(() => {
    const ti = txs.filter(t => t.type === "income").reduce((s, t) => s + t.krwAmount, 0)
    const te = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.krwAmount, 0)
    const bc = {}; CURRENCIES.forEach(c => { const i = txs.filter(t => t.type === "income" && t.currency === c.code).reduce((s, t) => s + t.foreignAmount, 0); const e = txs.filter(t => t.type === "expense" && t.currency === c.code).reduce((s, t) => s + t.foreignAmount, 0); bc[c.code] = { i, e, n: i - e } })
    const pt = {}; txs.forEach(t => { if (!pt[t.partner]) pt[t.partner] = { i: 0, e: 0 }; pt[t.partner][t.type === "income" ? "i" : "e"] += t.krwAmount })
    return { ti, te, net: ti - te, bc, pt }
  }, [txs])

  const addTx = (f) => { const r = rates[f.currency] || 0; const a = Number(f.foreignAmount); setTxs([{ ...f, id: Date.now(), foreignAmount: a, rate: r, krwAmount: toKRW(a, f.currency, r) }, ...txs]); setAddM(false) }
  const delTx = (id) => setTxs(txs.filter(t => t.id !== id))

  const S = {
    app: { fontFamily: "'Pretendard',sans-serif", background: "#08080f", color: "#e4e4ec", minHeight: "100vh", fontSize: 14 },
    hdr: { background: "#0c0c16", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, flexWrap: "wrap", gap: 8 },
    nav: { display: "flex", gap: 2, flexWrap: "wrap" },
    nb: (a) => ({ padding: "6px 13px", borderRadius: 7, border: "none", background: a ? "rgba(0,120,255,0.12)" : "transparent", color: a ? "#4da6ff" : "rgba(255,255,255,0.4)", fontWeight: a ? 600 : 400, fontSize: 12, cursor: "pointer" }),
    mn: { maxWidth: 1160, margin: "0 auto", padding: "16px 20px" },
    c: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 11, padding: 15 },
    ct: { fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, fontWeight: 500 },
    cv: { fontSize: 19, fontWeight: 700 },
    bd: (t) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 16, fontSize: 10, fontWeight: 600, background: t === "income" ? "rgba(0,210,120,0.1)" : "rgba(255,60,60,0.1)", color: t === "income" ? "#00d278" : "#ff5050" }),
    btn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0066ff,#0050dd)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" },
    bo: { padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.55)", fontSize: 11.5, cursor: "pointer" },
    bd2: { padding: "3px 8px", borderRadius: 5, border: "none", background: "rgba(255,60,60,0.08)", color: "#ff5050", fontSize: 10.5, cursor: "pointer" },
    mod: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    mc: { background: "#12121e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, width: 400, maxHeight: "85vh", overflowY: "auto" },
    inp: { width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#e4e4ec", fontSize: 13, outline: "none", boxSizing: "border-box" },
    sel: { width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#e4e4ec", fontSize: 13, outline: "none", boxSizing: "border-box" },
    lb: { display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 500 },
    th: { textAlign: "left", padding: "8px 10px", fontSize: 10, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: 0.7 },
    td: { padding: "9px 10px", background: "rgba(255,255,255,0.012)", fontSize: 12 },
  }

  const AddMod = () => {
    const [f, sF] = useState({ date: today(), type: "income", currency: "JPY", foreignAmount: "", partner: "", memo: "", category: "수출" })
    const est = f.foreignAmount ? toKRW(Number(f.foreignAmount), f.currency, rates[f.currency] || 0) : 0
    return <div style={S.mod} onClick={() => setAddM(false)}><div style={S.mc} onClick={e => e.stopPropagation()}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>거래 추가</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div><label style={S.lb}>거래일</label><input type="date" style={S.inp} value={f.date} onChange={e => sF({ ...f, date: e.target.value })} /></div>
        <div><label style={S.lb}>유형</label><select style={S.sel} value={f.type} onChange={e => sF({ ...f, type: e.target.value, category: e.target.value === "income" ? "수출" : "수입" })}><option value="income">입금</option><option value="expense">출금</option></select></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div><label style={S.lb}>통화</label><select style={S.sel} value={f.currency} onChange={e => sF({ ...f, currency: e.target.value })}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
        <div><label style={S.lb}>외화 금액</label><input type="number" style={S.inp} placeholder="0" value={f.foreignAmount} onChange={e => sF({ ...f, foreignAmount: e.target.value })} /></div>
      </div>
      <div style={{ background: "rgba(0,100,255,0.06)", borderRadius: 7, padding: "8px 12px", marginBottom: 8, fontSize: 11.5 }}>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>환율 {dispRate(f.currency, rates[f.currency] || 0)} → </span>
        <span style={{ color: "#4da6ff", fontWeight: 700 }}>{fmtKRW(est)}</span>
        {src === "live" && <span style={{ marginLeft: 6, fontSize: 9, color: "#00d278" }}>● 실시간</span>}
      </div>
      <div style={{ marginBottom: 8 }}><label style={S.lb}>거래처</label><input style={S.inp} placeholder="거래처명" value={f.partner} onChange={e => sF({ ...f, partner: e.target.value })} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div><label style={S.lb}>구분</label><select style={S.sel} value={f.category} onChange={e => sF({ ...f, category: e.target.value })}><option>수출</option><option>수입</option><option>환전</option><option>기타</option></select></div>
        <div><label style={S.lb}>메모</label><input style={S.inp} placeholder="내용" value={f.memo} onChange={e => sF({ ...f, memo: e.target.value })} /></div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...S.btn, flex: 1 }} onClick={() => { if (f.foreignAmount && f.partner) addTx(f) }}>저장</button>
        <button style={{ ...S.bo, flex: 1 }} onClick={() => setAddM(false)}>취소</button>
      </div>
    </div></div>
  }

  const Dash = () => <div>
    <Ad pos="top" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
      {CURRENCIES.map(c => {
        const h2 = hist[c.code] || []; const prev = h2.length >= 2 ? h2[h2.length - 2] : rates[c.code]; const d = rates[c.code] - prev; const p = prev ? ((d / prev) * 100).toFixed(2) : "0"; const up = d >= 0
        return <div key={c.code} style={{ ...S.c, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>{c.flag} {c.code}</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{rates[c.code]}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>원</span></div>
            <div style={{ fontSize: 10, color: up ? "#00d278" : "#ff5050" }}>{up ? "▲" : "▼"} {Math.abs(d).toFixed(2)} ({up ? "+" : ""}{p}%)</div>
          </div>
          <Spark data={h2.length > 1 ? h2 : [rates[c.code], rates[c.code]]} color={up ? "#00d278" : "#ff5050"} />
        </div>
      })}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, fontSize: 10.5 }}>
      <span style={{ color: "rgba(255,255,255,0.22)" }}>{src === "live" ? "🟢 한국수출입은행 실시간" : "🟡 시뮬레이션 (API키 등록 시 전환)"}{upd && ` · ${upd.toLocaleTimeString("ko-KR")}`}</span>
      <div style={{ display: "flex", gap: 6 }}><button style={S.bo} onClick={() => setAlertM(true)}>🔔 환율알림</button><button style={S.bo} onClick={fetchRates}>↻ 새로고침</button></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
      <div style={S.c}><div style={S.ct}>총 입금</div><div style={{ ...S.cv, color: "#00d278" }}>{fmtKRW(stats.ti)}</div></div>
      <div style={S.c}><div style={S.ct}>총 출금</div><div style={{ ...S.cv, color: "#ff5050" }}>{fmtKRW(stats.te)}</div></div>
      <div style={S.c}><div style={S.ct}>순 수지</div><div style={{ ...S.cv, color: stats.net >= 0 ? "#00d278" : "#ff5050" }}>{fmtKRW(stats.net)}</div></div>
    </div>
    <div style={{ ...S.c, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>통화별 잔액</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CURRENCIES.map(c => { const d = stats.bc[c.code]; return <div key={c.code} style={{ background: "rgba(255,255,255,0.012)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12, fontWeight: 600 }}>{c.flag} {c.code}</span><span style={{ fontSize: 14, fontWeight: 700, color: d.n >= 0 ? "#00d278" : "#ff5050" }}>{fmtF(Math.abs(d.n), c.code)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)" }}><span>입 {fmtF(d.i, c.code)}</span><span>출 {fmtF(d.e, c.code)}</span></div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>≈ {fmtKRW(toKRW(Math.abs(d.n), c.code, rates[c.code]))}</div>
        </div> })}
      </div>
    </div>
    <div style={S.c}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>최근 거래</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={S.bo} onClick={() => { exportCSV(txs, rates); setToast("✅ 엑셀 다운로드 완료"); setTimeout(() => setToast(""), 2000) }}>📥 엑셀</button>
          <button style={S.btn} onClick={() => setAddM(true)}>+ 추가</button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
        <thead><tr><th style={S.th}>일자</th><th style={S.th}>구분</th><th style={S.th}>거래처</th><th style={S.th}>외화</th><th style={S.th}>환율</th><th style={S.th}>원화</th><th style={S.th}>메모</th><th style={S.th}></th></tr></thead>
        <tbody>{txs.slice(0, 8).map(t => <tr key={t.id}>
          <td style={{ ...S.td, borderRadius: "6px 0 0 6px" }}>{t.date}</td>
          <td style={S.td}><span style={S.bd(t.type)}>{t.type === "income" ? "입금" : "출금"}</span></td>
          <td style={{ ...S.td, fontWeight: 600 }}>{t.partner}</td>
          <td style={S.td}>{CURRENCIES.find(c => c.code === t.currency)?.flag} {fmtF(t.foreignAmount, t.currency)}</td>
          <td style={{ ...S.td, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{t.rate}</td>
          <td style={{ ...S.td, fontWeight: 600, color: t.type === "income" ? "#00d278" : "#ff5050" }}>{fmtKRW(t.krwAmount)}</td>
          <td style={{ ...S.td, color: "rgba(255,255,255,0.3)" }}>{t.memo}</td>
          <td style={{ ...S.td, borderRadius: "0 6px 6px 0" }}><button style={S.bd2} onClick={() => delTx(t.id)}>삭제</button></td>
        </tr>)}</tbody>
      </table>
      </div>
    </div>
    <Ad pos="bottom" />
  </div>

  const TxTab = () => {
    const [ft, sFt] = useState("all"); const [fc, sFc] = useState("all")
    const fl = txs.filter(t => (ft === "all" || t.type === ft) && (fc === "all" || t.currency === fc))
    const fi = fl.filter(t => t.type === "income").reduce((s, t) => s + t.krwAmount, 0)
    const fe = fl.filter(t => t.type === "expense").reduce((s, t) => s + t.krwAmount, 0)
    return <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[["all", "전체"], ["income", "입금"], ["expense", "출금"]].map(([v, l]) => <button key={v} style={{ ...S.bo, ...(ft === v ? { background: "rgba(0,100,255,0.1)", color: "#4da6ff" } : {}) }} onClick={() => sFt(v)}>{l}</button>)}
          <select style={{ ...S.sel, width: "auto", padding: "6px 10px" }} value={fc} onChange={e => sFc(e.target.value)}><option value="all">모든 통화</option>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={S.bo} onClick={() => { exportCSV(fl, rates); setToast("✅ " + fl.length + "건 다운로드"); setTimeout(() => setToast(""), 2000) }}>📥 엑셀 ({fl.length}건)</button>
          <button style={S.btn} onClick={() => setAddM(true)}>+ 추가</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ ...S.c, flex: 1, padding: 10 }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>입금합계</span><div style={{ fontSize: 15, fontWeight: 700, color: "#00d278" }}>{fmtKRW(fi)}</div></div>
        <div style={{ ...S.c, flex: 1, padding: 10 }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>출금합계</span><div style={{ fontSize: 15, fontWeight: 700, color: "#ff5050" }}>{fmtKRW(fe)}</div></div>
        <div style={{ ...S.c, flex: 1, padding: 10 }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>차액</span><div style={{ fontSize: 15, fontWeight: 700, color: fi - fe >= 0 ? "#00d278" : "#ff5050" }}>{fmtKRW(fi - fe)}</div></div>
      </div>
      <div style={{ ...S.c, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
          <thead><tr><th style={S.th}>일자</th><th style={S.th}>구분</th><th style={S.th}>카테고리</th><th style={S.th}>거래처</th><th style={S.th}>외화</th><th style={S.th}>환율</th><th style={S.th}>원화</th><th style={S.th}>메모</th><th style={S.th}></th></tr></thead>
          <tbody>{fl.map(t => <tr key={t.id}>
            <td style={{ ...S.td, borderRadius: "6px 0 0 6px" }}>{t.date}</td>
            <td style={S.td}><span style={S.bd(t.type)}>{t.type === "income" ? "입금" : "출금"}</span></td>
            <td style={S.td}>{t.category}</td>
            <td style={{ ...S.td, fontWeight: 600 }}>{t.partner}</td>
            <td style={S.td}>{CURRENCIES.find(c => c.code === t.currency)?.flag} {fmtF(t.foreignAmount, t.currency)}</td>
            <td style={{ ...S.td, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{t.rate}</td>
            <td style={{ ...S.td, fontWeight: 600, color: t.type === "income" ? "#00d278" : "#ff5050" }}>{fmtKRW(t.krwAmount)}</td>
            <td style={{ ...S.td, color: "rgba(255,255,255,0.3)" }}>{t.memo}</td>
            <td style={{ ...S.td, borderRadius: "0 6px 6px 0" }}><button style={S.bd2} onClick={() => delTx(t.id)}>삭제</button></td>
          </tr>)}</tbody>
        </table>
        {fl.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.2)" }}>조건에 맞는 거래 없음</div>}
      </div>
    </div>
  }

  const PtTab = () => {
    const list = Object.entries(stats.pt).map(([n, d]) => ({ n, ...d, net: d.i - d.e })).sort((a, b) => (b.i + b.e) - (a.i + a.e))
    return <div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>거래처별 현황</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {list.map(p => <div key={p.n} style={S.c}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{p.n}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
            <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>입금</div><div style={{ fontSize: 12.5, fontWeight: 600, color: "#00d278" }}>{fmtKRW(p.i)}</div></div>
            <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>출금</div><div style={{ fontSize: 12.5, fontWeight: 600, color: "#ff5050" }}>{fmtKRW(p.e)}</div></div>
            <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>순수지</div><div style={{ fontSize: 12.5, fontWeight: 700, color: p.net >= 0 ? "#00d278" : "#ff5050" }}>{fmtKRW(p.net)}</div></div>
          </div>
          <div style={{ marginTop: 7, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${p.i + p.e > 0 ? (p.i / (p.i + p.e)) * 100 : 50}%`, background: "linear-gradient(90deg,#00d278,#00a060)", borderRadius: 2 }} />
          </div>
        </div>)}
      </div>
    </div>
  }

  const CalcTab = () => {
    const [c, sC] = useState("JPY"); const [a, sA] = useState("1000000")
    const kr = a ? toKRW(Number(a), c, rates[c] || 0) : 0
    return <div style={{ ...S.c, maxWidth: 440 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>환율 계산기</div>
      <div style={{ marginBottom: 10 }}><label style={S.lb}>통화</label><select style={S.sel} value={c} onChange={e => sC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.flag} {x.code} - {x.name}</option>)}</select></div>
      <div style={{ marginBottom: 12 }}><label style={S.lb}>외화 금액</label><input type="number" style={{ ...S.inp, fontSize: 17, fontWeight: 700, padding: "11px 13px" }} value={a} onChange={e => sA(e.target.value)} /></div>
      <div style={{ background: "linear-gradient(135deg,rgba(0,100,255,0.07),rgba(0,210,120,0.05))", borderRadius: 10, padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>적용: {dispRate(c, rates[c] || 0)} {src === "live" ? "🟢" : "🟡"}</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{fmtKRW(kr)}</div>
      </div>
    </div>
  }

  const AlertMod = () => {
    const [f, sF] = useState({ currency: "JPY", cond: "below", target: "" })
    return <div style={S.mod} onClick={() => setAlertM(false)}><div style={S.mc} onClick={e => e.stopPropagation()}>
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>환율 알림</h3>
      <div style={{ marginBottom: 8 }}><label style={S.lb}>통화</label><select style={S.sel} value={f.currency} onChange={e => sF({ ...f, currency: e.target.value })}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div><label style={S.lb}>조건</label><select style={S.sel} value={f.cond} onChange={e => sF({ ...f, cond: e.target.value })}><option value="below">이하</option><option value="above">이상</option></select></div>
        <div><label style={S.lb}>목표(원)</label><input type="number" style={S.inp} value={f.target} onChange={e => sF({ ...f, target: e.target.value })} /></div>
      </div>
      <button style={{ ...S.btn, width: "100%", marginTop: 6 }} onClick={() => { if (f.target) { setAlerts([...alerts, { ...f, id: Date.now(), target: Number(f.target) }]); setAlertM(false) } }}>등록</button>
      {alerts.length > 0 && <div style={{ marginTop: 12 }}>{alerts.map(a => <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 11.5 }}>
        <span>{CURRENCIES.find(c => c.code === a.currency)?.flag} {a.currency} {a.target}원 {a.cond === "below" ? "↓" : "↑"}</span>
        <button onClick={() => setAlerts(alerts.filter(x => x.id !== a.id))} style={{ background: "none", border: "none", color: "#ff5050", cursor: "pointer", fontSize: 11 }}>삭제</button>
      </div>)}</div>}
    </div></div>
  }

  return <div style={S.app}>
    <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
    <header style={S.hdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#0088ff,#00c6ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>FX</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>ForexFlow</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", padding: "1px 6px", borderRadius: 3 }}>v2</span>
      </div>
      <nav style={S.nav}>
        {[["dashboard", "📊 대시보드"], ["transactions", "📋 거래내역"], ["partners", "🤝 거래처"], ["calculator", "🔢 계산기"]].map(([k, l]) =>
          <button key={k} style={S.nb(tab === k)} onClick={() => setTab(k)}>{l}</button>
        )}
      </nav>
    </header>
    <main style={S.mn}>
      {tab === "dashboard" && <Dash />}
      {tab === "transactions" && <TxTab />}
      {tab === "partners" && <PtTab />}
      {tab === "calculator" && <CalcTab />}
    </main>
    {addM && <AddMod />}
    {alertM && <AlertMod />}
    {toast && <div style={{ position: "fixed", bottom: 20, right: 20, background: "#00d278", color: "#000", padding: "9px 18px", borderRadius: 9, fontWeight: 600, fontSize: 12.5, zIndex: 2000, boxShadow: "0 4px 16px rgba(0,210,120,0.3)" }}>{toast}</div>}
  </div>
}
