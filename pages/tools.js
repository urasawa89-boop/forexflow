import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"

const CURRENCIES = [
  { code: "USD", name: "미국 달러", symbol: "$", flag: "🇺🇸" },
  { code: "JPY", name: "일본 엔(100)", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", name: "중국 위안", symbol: "¥", flag: "🇨🇳" },
  { code: "EUR", name: "유로", symbol: "€", flag: "🇪🇺" },
]
const FALLBACK = { USD: 1385.5, JPY: 921.0, CNY: 190.3, EUR: 1510.2 }

function fmtKRW(n) { return "₩" + Math.round(n || 0).toLocaleString("ko-KR") }
function fmtF(a, c) { return c === "JPY" ? "¥" + Math.round(a).toLocaleString() : (CURRENCIES.find(x => x.code === c)?.symbol || "") + Number(a).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function toKRW(a, c, r) { return c === "JPY" ? (a / 100) * r : a * r }
function today() { return new Date().toISOString().split("T")[0] }

export default function ToolsPage() {
  const [tab, setTab] = useState("cost")
  const [rates, setRates] = useState(FALLBACK)
  const [src, setSrc] = useState("sim")

  useEffect(() => {
    fetch("/api/rates").then(r => r.json()).then(d => {
      if (d.success) { setRates({ ...FALLBACK, ...d.rates }); setSrc("live") }
    }).catch(() => {})
  }, [])

  const S = {
    app: { fontFamily: "'Pretendard',sans-serif", background: "#2B3539", color: "#E8E4DF", minHeight: "100vh", fontSize: 14 },
    hdr: { background: "#242D31", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52, flexWrap: "wrap", gap: 8 },
    mn: { maxWidth: 1160, margin: "0 auto", padding: "16px 20px" },
    c: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 15 },
    inp: { width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "#E8E4DF", fontSize: 13, outline: "none", boxSizing: "border-box" },
    sel: { width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "#E8E4DF", fontSize: 13, outline: "none", boxSizing: "border-box" },
    lb: { display: "block", fontSize: 11, color: "rgba(232,228,223,0.45)", marginBottom: 4, fontWeight: 500 },
    btn: { padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#E8612D,#F07A4A)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" },
    bo: (a) => ({ padding: "7px 14px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: a ? "rgba(232,97,45,0.12)" : "transparent", color: a ? "#E8612D" : "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontWeight: a ? 600 : 400 }),
    row: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12.5, borderBottom: "1px solid rgba(255,255,255,0.03)" },
  }

  // ── 수입원가 계산기 (부대비용 포함) ──
  const CostCalc = () => {
    const [f, sF] = useState({
      cur: "JPY", amount: "5000000", qty: "3000", unit: "kg", tariffRate: "20",
      shipping: "500000", insurance: "50000", customs_fee: "150000", inspection: "100000", transport: "200000", storage: "100000", other: "0"
    })

    const cifKRW = toKRW(Number(f.amount) || 0, f.cur, rates[f.cur] || 0)
    const tariff = cifKRW * (Number(f.tariffRate) / 100)
    const subtaxBase = cifKRW + tariff
    const vat = subtaxBase * 0.1
    const totalDuty = tariff + vat
    const extras = [Number(f.shipping), Number(f.insurance), Number(f.customs_fee), Number(f.inspection), Number(f.transport), Number(f.storage), Number(f.other)].reduce((s, v) => s + (v || 0), 0)
    const totalCost = cifKRW + totalDuty + extras
    const unitCost = Number(f.qty) > 0 ? totalCost / Number(f.qty) : 0
    const marginPrice10 = unitCost * 1.1
    const marginPrice20 = unitCost * 1.2
    const marginPrice30 = unitCost * 1.3

    return <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Input */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📥 수입 기본 정보</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><label style={S.lb}>통화</label><select style={S.sel} value={f.cur} onChange={e => sF({ ...f, cur: e.target.value })}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
            <div><label style={S.lb}>수입금액 (외화)</label><input type="number" style={S.inp} value={f.amount} onChange={e => sF({ ...f, amount: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><label style={S.lb}>수량</label><input type="number" style={S.inp} value={f.qty} onChange={e => sF({ ...f, qty: e.target.value })} /></div>
            <div><label style={S.lb}>단위</label><select style={S.sel} value={f.unit} onChange={e => sF({ ...f, unit: e.target.value })}><option>kg</option><option>box</option><option>ton</option><option>ea</option></select></div>
            <div><label style={S.lb}>관세율 (%)</label><input type="number" style={S.inp} value={f.tariffRate} onChange={e => sF({ ...f, tariffRate: e.target.value })} /></div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, marginTop: 16 }}>📦 부대비용 (원화)</div>
          {[
            ["shipping", "해상운임 (Freight)", "컨테이너 운송비"],
            ["insurance", "보험료 (Insurance)", "적하보험료"],
            ["customs_fee", "관세사 수수료", "통관대행 수수료"],
            ["inspection", "검역/검사비", "식품검사, 검역 비용"],
            ["transport", "내륙운송비", "항구→창고 운송비"],
            ["storage", "보관료 (냉장/냉동)", "냉장·냉동창고 보관비"],
            ["other", "기타비용", "하역비, 서류비 등"],
          ].map(([key, label, hint]) =>
            <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <label style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)" }}>{label}<br /><span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{hint}</span></label>
              <input type="number" style={S.inp} value={f[key]} onChange={e => sF({ ...f, [key]: e.target.value })} />
            </div>
          )}
        </div>

        {/* Result */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📊 수입원가 분석 {src === "live" ? "🟢" : "🟡"}</div>
          <div style={{ background: "rgba(255,255,255,0.015)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={S.row}><span style={{ color: "rgba(232,228,223,0.45)" }}>물품가격 (CIF 원화환산)</span><span style={{ fontWeight: 600 }}>{fmtKRW(cifKRW)}</span></div>
            <div style={S.row}><span style={{ color: "rgba(232,228,223,0.45)" }}>┗ 외화금액</span><span>{fmtF(Number(f.amount) || 0, f.cur)}</span></div>
            <div style={S.row}><span style={{ color: "rgba(232,228,223,0.45)" }}>┗ 적용환율</span><span>{rates[f.cur]}</span></div>
            <div style={{ ...S.row, borderBottom: "2px solid rgba(255,255,255,0.07)" }}><span style={{ color: "#ff8c00" }}>관세 ({f.tariffRate}%)</span><span style={{ color: "#ff8c00", fontWeight: 600 }}>+ {fmtKRW(tariff)}</span></div>
            <div style={S.row}><span style={{ color: "#ff8c00" }}>부가세 (10%)</span><span style={{ color: "#ff8c00" }}>+ {fmtKRW(vat)}</span></div>
            <div style={{ ...S.row, borderBottom: "2px solid rgba(255,255,255,0.07)" }}><span style={{ fontWeight: 600 }}>세금 소계</span><span style={{ fontWeight: 600 }}>{fmtKRW(totalDuty)}</span></div>

            {[["해상운임", f.shipping], ["보험료", f.insurance], ["관세사 수수료", f.customs_fee], ["검역/검사비", f.inspection], ["내륙운송비", f.transport], ["보관료", f.storage], ["기타비용", f.other]].map(([l, v], i) =>
              Number(v) > 0 ? <div key={i} style={S.row}><span style={{ color: "rgba(255,255,255,0.3)" }}>{l}</span><span style={{ color: "rgba(255,255,255,0.5)" }}>+ {fmtKRW(Number(v))}</span></div> : null
            )}
            <div style={S.row}><span style={{ color: "rgba(232,228,223,0.45)" }}>부대비용 소계</span><span>{fmtKRW(extras)}</span></div>
          </div>

          {/* Total */}
          <div style={{ background: "rgba(232,97,45,0.08)", borderRadius: 10, padding: 16, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>총 수입원가</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#E8612D" }}>{fmtKRW(totalCost)}</div>
          </div>

          <div style={{ background: "rgba(0,210,120,0.05)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E8612D", marginBottom: 8 }}>{f.unit}당 원가 분석</div>
            <div style={S.row}><span style={{ color: "rgba(232,228,223,0.45)" }}>{f.unit}당 수입원가</span><span style={{ fontSize: 16, fontWeight: 800, color: "#E8612D" }}>{fmtKRW(unitCost)}</span></div>
            <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              마진별 판매가: 10% → {fmtKRW(marginPrice10)} · 20% → {fmtKRW(marginPrice20)} · 30% → {fmtKRW(marginPrice30)}
            </div>
          </div>

          {/* Cost breakdown chart */}
          <div style={{ background: "rgba(255,255,255,0.015)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>비용 구성 비율</div>
            {[["물품가격", cifKRW, "#E8612D"], ["관세+부가세", totalDuty, "#ff8c00"], ["부대비용", extras, "#bb86fc"]].map(([l, v, c]) =>
              <div key={l} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                  <span style={{ color: "rgba(232,228,223,0.45)" }}>{l}</span>
                  <span style={{ color: c }}>{fmtKRW(v)} ({totalCost > 0 ? ((v / totalCost) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${totalCost > 0 ? (v / totalCost) * 100 : 0}%`, background: c, borderRadius: 3 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  }

  // ── 환율 환산 견적서 생성기 ──
  const QuoteGen = () => {
    const [q, sQ] = useState({
      sellerName: "", buyerName: "", cur: "JPY", date: today(),
      items: [{ name: "대게 (냉동)", qty: "1000", unit: "kg", price: "2500" }]
    })

    const addItem = () => sQ({ ...q, items: [...q.items, { name: "", qty: "", unit: "kg", price: "" }] })
    const removeItem = (i) => sQ({ ...q, items: q.items.filter((_, idx) => idx !== i) })
    const updateItem = (i, key, val) => { const ni = [...q.items]; ni[i] = { ...ni[i], [key]: val }; sQ({ ...q, items: ni }) }

    const totalForeign = q.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0)
    const totalKRW = toKRW(totalForeign, q.cur, rates[q.cur] || 0)

    const printQuote = () => {
      const cur = CURRENCIES.find(c => c.code === q.cur)
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>견적서</title>
<style>body{font-family:'Malgun Gothic',sans-serif;padding:40px;color:#222;max-width:800px;margin:0 auto}
h1{text-align:center;font-size:22px;border-bottom:3px double #333;padding-bottom:10px}
.info{display:flex;justify-content:space-between;margin:20px 0}
.info div{width:48%}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ccc;padding:8px 12px;text-align:right;font-size:13px}
th{background:#f5f5f5;text-align:center}
td:first-child,td:nth-child(2){text-align:left}
.total{font-size:18px;font-weight:bold;text-align:right;margin:10px 0;padding:10px;background:#f0f7ff;border-radius:8px}
.footer{margin-top:30px;font-size:11px;color:#888;text-align:center;border-top:1px solid #eee;padding-top:10px}
</style></head><body>
<h1>견 적 서 (QUOTATION)</h1>
<div class="info">
<div><strong>수출자 (Seller):</strong><br>${q.sellerName || "(미입력)"}</div>
<div style="text-align:right"><strong>수입자 (Buyer):</strong><br>${q.buyerName || "(미입력)"}<br><br><strong>일자:</strong> ${q.date}<br><strong>통화:</strong> ${cur?.flag} ${q.cur} (${cur?.name})<br><strong>적용환율:</strong> ${rates[q.cur]}</div>
</div>
<table>
<thead><tr><th>No.</th><th>품목명</th><th>수량</th><th>단위</th><th>단가 (${cur?.symbol})</th><th>금액 (${cur?.symbol})</th><th>원화 환산 (₩)</th></tr></thead>
<tbody>
${q.items.map((it, i) => {
  const amt = (Number(it.qty) || 0) * (Number(it.price) || 0)
  const krw = toKRW(amt, q.cur, rates[q.cur] || 0)
  return `<tr><td style="text-align:center">${i + 1}</td><td>${it.name}</td><td>${Number(it.qty || 0).toLocaleString()}</td><td>${it.unit}</td><td>${Number(it.price || 0).toLocaleString()}</td><td>${amt.toLocaleString()}</td><td>${Math.round(krw).toLocaleString()}</td></tr>`
}).join("")}
</tbody>
</table>
<div class="total">
합계: ${cur?.symbol}${totalForeign.toLocaleString()} &nbsp;&nbsp;|&nbsp;&nbsp; 원화 환산: ₩${Math.round(totalKRW).toLocaleString()}
</div>
<div class="footer">
본 견적서의 환율은 한국수출입은행 매매기준율 (${rates[q.cur]}) 기준이며, 실제 결제 시 환율 변동에 따라 금액이 달라질 수 있습니다.<br>
Generated by Bay Works · ${new Date().toLocaleString("ko-KR")}
</div></body></html>`

      const w = window.open("", "_blank")
      w.document.write(html)
      w.document.close()
      w.print()
    }

    return <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div><label style={S.lb}>수출자 (Seller)</label><input style={S.inp} value={q.sellerName} onChange={e => sQ({ ...q, sellerName: e.target.value })} placeholder="회사명" /></div>
        <div><label style={S.lb}>수입자 (Buyer)</label><input style={S.inp} value={q.buyerName} onChange={e => sQ({ ...q, buyerName: e.target.value })} placeholder="거래처명" /></div>
        <div><label style={S.lb}>통화</label><select style={S.sel} value={q.cur} onChange={e => sQ({ ...q, cur: e.target.value })}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
        <div><label style={S.lb}>견적일</label><input type="date" style={S.inp} value={q.date} onChange={e => sQ({ ...q, date: e.target.value })} /></div>
      </div>

      {/* Items */}
      <div style={{ ...S.c, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>품목 내역</span>
          <button style={S.btn} onClick={addItem}>+ 품목 추가</button>
        </div>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
          <thead><tr>
            <th style={{ textAlign: "left", padding: "6px 8px", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>품목명</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>수량</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>단위</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>단가(외화)</th>
            <th style={{ textAlign: "right", padding: "6px 8px", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>소계(외화)</th>
            <th style={{ textAlign: "right", padding: "6px 8px", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>원화 환산</th>
            <th style={{ width: 40 }}></th>
          </tr></thead>
          <tbody>{q.items.map((it, i) => {
            const amt = (Number(it.qty) || 0) * (Number(it.price) || 0)
            const krw = toKRW(amt, q.cur, rates[q.cur] || 0)
            return <tr key={i}>
              <td style={{ padding: 3 }}><input style={{ ...S.inp, fontSize: 12 }} value={it.name} onChange={e => updateItem(i, "name", e.target.value)} placeholder="품목명" /></td>
              <td style={{ padding: 3, width: 80 }}><input type="number" style={{ ...S.inp, fontSize: 12, textAlign: "center" }} value={it.qty} onChange={e => updateItem(i, "qty", e.target.value)} /></td>
              <td style={{ padding: 3, width: 70 }}><select style={{ ...S.sel, fontSize: 12 }} value={it.unit} onChange={e => updateItem(i, "unit", e.target.value)}><option>kg</option><option>box</option><option>ton</option><option>ea</option></select></td>
              <td style={{ padding: 3, width: 100 }}><input type="number" style={{ ...S.inp, fontSize: 12, textAlign: "right" }} value={it.price} onChange={e => updateItem(i, "price", e.target.value)} /></td>
              <td style={{ padding: "3px 8px", fontSize: 12, textAlign: "right", fontWeight: 600 }}>{fmtF(amt, q.cur)}</td>
              <td style={{ padding: "3px 8px", fontSize: 12, textAlign: "right", color: "#E8612D" }}>{fmtKRW(krw)}</td>
              <td style={{ padding: 3 }}>{q.items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: "rgba(255,50,50,0.1)", border: "none", color: "#ff5050", borderRadius: 4, cursor: "pointer", padding: "2px 6px", fontSize: 11 }}>✕</button>}</td>
            </tr>
          })}</tbody>
        </table>
        </div>
      </div>

      {/* Total + Print */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>적용환율: {rates[q.cur]} {src === "live" ? "🟢 실시간" : "🟡 시뮬레이션"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>합계</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{fmtF(totalForeign, q.cur)} = <span style={{ color: "#E8612D" }}>{fmtKRW(totalKRW)}</span></div>
          </div>
          <button style={{ ...S.btn, padding: "12px 24px" }} onClick={printQuote}>🖨️ 견적서 인쇄/PDF</button>
        </div>
      </div>
    </div>
  }

  return <div style={S.app}>
    <Head><title>수입원가 계산기 · 견적서 - Bay Works</title></Head>
    <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
    <header style={S.hdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="Bay Works" style={{ height: 36, width: "auto" }}
          />
        </Link>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>/ 수입도구</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button style={S.bo(tab === "cost")} onClick={() => setTab("cost")}>🧮 수입원가 계산기</button>
        <button style={S.bo(tab === "quote")} onClick={() => setTab("quote")}>📄 환율 견적서</button>
        <Link href="/" style={{ ...S.bo(false), textDecoration: "none", display: "inline-block" }}>← 대시보드</Link>
      </div>
    </header>

    <main style={S.mn}>
      {tab === "cost" && <>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧮 수입원가 계산기 (부대비용 포함)</h1>
        <CostCalc />
      </>}
      {tab === "quote" && <>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📄 환율 환산 견적서 생성기</h1>
        <QuoteGen />
      </>}
    </main>
  </div>
}
