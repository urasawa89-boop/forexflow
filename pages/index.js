 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/pages/index.js b/pages/index.js
index a6bee31fff1ce27323aad2deef8ec325c1b80eac..669e09f3f67021d72545f74ee7623aad750f1bea 100644
--- a/pages/index.js
+++ b/pages/index.js
@@ -80,54 +80,61 @@ function toKRW(a, c, r) { return c === "JPY" ? (a / 100) * r : a * r }
 function dispRate(c, r) { return c === "JPY" ? (r / 100).toFixed(2) + "원/1엔" : r.toFixed(2) + "원" }
 function today() { return new Date().toISOString().split("T")[0] }
 function getProd(id) { return SEAFOOD_DB.find(p => p.id === id) || SEAFOOD_DB[SEAFOOD_DB.length - 1] }
 
 function Spark({ data, color, w = 76, h = 26 }) {
   if (!data || data.length < 2) return null
   const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
   const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ")
   return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
 }
 
 function Ad({ pos }) {
   return <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 1, marginBottom: pos === "top" ? 16 : 0, marginTop: pos === "bottom" ? 16 : 0 }}>
     AD · Google AdSense / 카카오 애드핏
   </div>
 }
 
 // Brand Colors
 const B = {
   orange: "#E8612D", orangeLight: "#F07A4A", orangeDim: "rgba(232,97,45,0.12)",
   bg: "#2B3539", bgCard: "rgba(255,255,255,0.04)", bgCardBorder: "rgba(255,255,255,0.07)",
   text: "#E8E4DF", textDim: "rgba(232,228,223,0.45)", textDimmer: "rgba(232,228,223,0.25)",
   green: "#4CAF50", red: "#EF5350", blue: "#42A5F5", headerBg: "#242D31",
 }
 
-export default function Home() {
+const TAB_TO_PATH = {
+  dashboard: "/",
+  products: "/products",
+  ocean: "/ocean",
+  calculator: "/calculator",
+}
+
+export default function Home({ initialTab = "dashboard" }) {
   const router = useRouter()
-  const tab = router.query.tab || "dashboard"
-  const setTab = (t) => router.push(t === "dashboard" ? "/" : `/?tab=${t}`, undefined, { shallow: true })
+  const tab = initialTab || "dashboard"
+  const setTab = (t) => router.push(TAB_TO_PATH[t] || "/")
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
   const [rateView, setRateView] = useState("card") // "card" or "table"
 
   // ── 환율 API ──
   const fetchRates = useCallback(async () => {
     try {
       const res = await fetch("/api/rates")
       const data = await res.json()
       if (data.success && Object.keys(data.rates).length > 0) {
         const nr = { ...FALLBACK, ...data.rates }
         setRates(nr)
         if (data.detailed) setDetailed(data.detailed)
         setHist(p => { const h = {}; Object.keys(nr).forEach(k => { h[k] = [...(p[k] || []).slice(-13), nr[k]] }); return h })
         setSrc("live"); setUpd(new Date()); return
       }
@@ -204,52 +211,52 @@ export default function Home() {
       <div style={{ background: "rgba(255,255,255,0.015)", borderRadius: 9, padding: 14 }}>
         <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "rgba(255,255,255,0.5)" }}>수입 비용 내역 {src === "live" ? "🟢" : "🟡"}</div>
         {[["물품가격 (CIF)", fmtKRW(krw), null], [`관세 (${prod.tariff}%)`, "+ " + fmtKRW(tariffAmt), "#E8612D"], ["부가세 (10%)", "+ " + fmtKRW(vat), "#E8612D"]].map(([l, v, c], i) =>
           <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
             <span style={{ color: "rgba(255,255,255,0.4)" }}>{l}</span><span style={{ color: c || "inherit" }}>{v}</span>
           </div>
         )}
         <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 4px", fontSize: 14, fontWeight: 700 }}>
           <span>총 수입원가</span><span style={{ color: "#E8612D" }}>{fmtKRW(total)}</span>
         </div>
         <div style={{ background: "rgba(232,97,45,0.06)", borderRadius: 6, padding: "6px 10px", marginTop: 6, textAlign: "center" }}>
           <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{prod.unit}당 원가: </span>
           <span style={{ fontSize: 15, fontWeight: 800, color: "#4CAF50" }}>{fmtKRW(unitKRW)}</span>
         </div>
       </div>
     </div>
   }
 
   // ── Dashboard ──
   const Dash = () => <div>
     <Ad pos="top" />
     {/* Detailed Exchange Rates */}
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
       <div style={S.secT}>💱 수출입 환율</div>
       <div style={{ display: "flex", gap: 4 }}>
-        <button style={{ ...S.bo, ...(rateView === "card" ? { background: "rgba(232,97,45,0.12)", color: "#E8612D" } : {}) }} onClick={() => setRateView("card")}>카드</button>
-        <button style={{ ...S.bo, ...(rateView === "table" ? { background: "rgba(232,97,45,0.12)", color: "#E8612D" } : {}) }} onClick={() => setRateView("table")}>표</button>
+        <button style={{ ...S.bo(rateView === "card"), ...(rateView === "card" ? { background: "rgba(232,97,45,0.12)", color: "#E8612D" } : {}) }} onClick={() => setRateView("card")}>카드</button>
+        <button style={{ ...S.bo(rateView === "table"), ...(rateView === "table" ? { background: "rgba(232,97,45,0.12)", color: "#E8612D" } : {}) }} onClick={() => setRateView("table")}>표</button>
       </div>
     </div>
 
     {rateView === "card" ? (
     <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
       {CURRENCIES.map(c => {
         const h2 = hist[c.code] || []; const prev = h2.length >= 2 ? h2[h2.length - 2] : rates[c.code]; const d = rates[c.code] - prev; const p = prev ? ((d / prev) * 100).toFixed(2) : "0"; const up = d >= 0
         const det = detailed[c.code]
         const tts = det?.tts || null
         const ttb = det?.ttb || null
         const spread = tts && ttb ? (tts - ttb).toFixed(2) : null
         return <div key={c.code} style={S.c}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
             <div>
               <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>{c.flag} {c.code}</div>
               <div style={{ fontSize: 17, fontWeight: 700 }}>{rates[c.code]}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>원</span></div>
               <div style={{ fontSize: 10, color: up ? "#4CAF50" : "#EF5350" }}>{up ? "▲" : "▼"} {Math.abs(d).toFixed(2)} ({up ? "+" : ""}{p}%)</div>
             </div>
             <Spark data={h2.length > 1 ? h2 : [rates[c.code], rates[c.code]]} color={up ? "#4CAF50" : "#EF5350"} />
           </div>
           {/* 상세 환율 */}
           <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 6 }}>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}>
               <span style={{ color: "rgba(255,255,255,0.35)" }}>매매기준율</span>
               <span style={{ fontWeight: 600 }}>{det?.base || rates[c.code]}</span>
@@ -282,80 +289,80 @@ export default function Home() {
           <th style={S.th}>등락</th>
         </tr></thead>
         <tbody>{CURRENCIES.map(c => {
           const det = detailed[c.code]
           const h2 = hist[c.code] || []; const prev = h2.length >= 2 ? h2[h2.length - 2] : rates[c.code]; const d = rates[c.code] - prev; const up = d >= 0
           const tts = det?.tts; const ttb = det?.ttb
           const spread = tts && ttb ? (tts - ttb).toFixed(2) : "-"
           return <tr key={c.code}>
             <td style={{ ...S.td, borderRadius: "6px 0 0 6px", fontWeight: 600 }}>{c.flag} {c.code} <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{c.name}</span></td>
             <td style={{ ...S.td, fontWeight: 700, fontSize: 14 }}>{det?.base || rates[c.code]}</td>
             <td style={{ ...S.td, color: "#E8612D", fontWeight: 600 }}>{tts || "-"}</td>
             <td style={{ ...S.td, color: "#4CAF50", fontWeight: 600 }}>{ttb || "-"}</td>
             <td style={{ ...S.td, color: "rgba(255,255,255,0.3)" }}>{spread}</td>
             <td style={{ ...S.td, borderRadius: "0 6px 6px 0", color: up ? "#4CAF50" : "#EF5350", fontWeight: 600 }}>{up ? "▲" : "▼"} {Math.abs(d).toFixed(2)}</td>
           </tr>
         })}</tbody>
       </table>
       <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(255,255,255,0.015)", borderRadius: 7, fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>
         💡 <strong>TTS(전신환매도율)</strong> = 수입대금 송금 시 은행이 외화를 파는 가격 (원화→외화) · <strong>TTB(전신환매입율)</strong> = 수출대금 입금 시 은행이 외화를 사는 가격 (외화→원화)
       </div>
     </div>
     )}
 
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 10.5 }}>
       <span style={{ color: "rgba(255,255,255,0.22)" }}>{src === "live" ? "🟢 한국수출입은행 실시간" : "🟡 시뮬레이션"}{upd && ` · ${upd.toLocaleTimeString("ko-KR")}`}</span>
-      <div style={{ display: "flex", gap: 6 }}><button style={S.bo} onClick={() => setAlertM(true)}>🔔 환율알림</button><button style={S.bo} onClick={fetchRates}>↻ 새로고침</button></div>
+      <div style={{ display: "flex", gap: 6 }}><button style={S.bo(false)} onClick={() => setAlertM(true)}>🔔 환율알림</button><button style={S.bo(false)} onClick={fetchRates}>↻ 새로고침</button></div>
     </div>
 
     {/* Import Cost Simulator */}
     <div style={{ ...S.c, marginBottom: 16 }}>
       <div style={S.secT}>🧮 수입 비용 시뮬레이터</div>
       <ImportCalc />
     </div>
 
     {/* Quick HS Code Lookup */}
     <div style={{ ...S.c, marginBottom: 16 }}>
       <div style={S.secT}>📋 주요 수산물 HS코드 · 관세율 (빠른조회)</div>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
         {SEAFOOD_DB.filter(p => p.hs !== "-").slice(0, 16).map(p =>
           <div key={p.id} style={{ background: "rgba(255,255,255,0.015)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.03)" }}>
             <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{p.emoji} {p.name}</div>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
               <code style={{ color: "#F07A4A" }}>{p.hs}</code>
               <span style={{ color: p.tariff > 15 ? "#E8612D" : "#4CAF50", fontWeight: 600 }}>{p.tariff}%</span>
             </div>
           </div>
         )}
       </div>
     </div>
 
     {/* Ocean Info Preview */}
     {oceanData.length > 0 && <div style={S.c}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
         <div style={S.secT}>🌊 실시간 해양정보</div>
-        <button style={S.bo} onClick={() => setTab("ocean")}>전체보기 →</button>
+        <button style={S.bo(false)} onClick={() => setTab("ocean")}>전체보기 →</button>
       </div>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
         {oceanData.slice(0, 5).map(st =>
           <div key={st.code} style={{ background: "rgba(255,255,255,0.015)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
             <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{st.name}</div>
             <div style={{ fontSize: 15, fontWeight: 700, color: Number(st.waveHeight) > 1.5 ? "#EF5350" : "#E8612D" }}>{st.waveHeight}m</div>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>수온 {st.waterTemp}℃</div>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{st.tideStatus}</div>
           </div>
         )}
       </div>
     </div>}
 
     {/* 수산물 뉴스 섹션 */}
     <div style={{ ...S.c, marginTop: 16 }}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
         <div style={S.secT}>수산물 수출입 뉴스</div>
         <a href="/news" style={{ fontSize: 11, color: "#E8612D", textDecoration: "none" }}>전체보기 →</a>
       </div>
       {[
         { source: "해양수산부", title: "2026년 수산식품 수출 목표 35억 달러… 김·참치·굴 집중 육성", date: "2026-03-24", tag: "정책", color: "#E8612D" },
         { source: "수입식품정보마루", title: "일본산 수입식품 방사능검사 결과 (3.13~3.19) — 전량 적합", date: "2026-03-20", tag: "검역", color: "#EF5350" },
         { source: "FTA 포털", title: "RCEP 4년차 관세인하 적용… 일본산 수산물 세율 변동 안내", date: "2026-03-18", tag: "FTA", color: "#4CAF50" },
         { source: "국립수산물품질관리원", title: "중국산 냉동 오징어 잔류약물 기준 초과 — 수입금지 조치", date: "2026-03-16", tag: "검역", color: "#EF5350" },
         { source: "한국수산무역협회", title: "냉동새우 수입량 전년 대비 12% 증가… 동남아산 비중 확대", date: "2026-03-12", tag: "통계", color: "#bb86fc" },
@@ -410,57 +417,57 @@ export default function Home() {
       </div>
       {/* Import Calculator below */}
       <div style={{ ...S.c, marginTop: 16 }}>
         <div style={S.secT}>🧮 수입 비용 시뮬레이터</div>
         <ImportCalc />
       </div>
     </div>
   }
 
   // ── Ocean Tab (물때/파고/수온) ──
   const OceanTab = () => {
     const regions = ["전체", "서해", "남해", "동해"]
     const filtered = oceanRegion === "전체" ? oceanData : oceanData.filter(s => s.region === oceanRegion)
 
     const getWaveColor = (h) => { const v = Number(h); if (v >= 2.0) return "#ff3333"; if (v >= 1.5) return "#E8612D"; if (v >= 1.0) return "#F07A4A"; return "#4CAF50" }
     const getWaveLabel = (h) => { const v = Number(h); if (v >= 2.5) return "매우 높음"; if (v >= 2.0) return "높음"; if (v >= 1.5) return "약간 높음"; if (v >= 1.0) return "보통"; return "잔잔" }
     const getTideIcon = (s) => { if (s === "만조") return "🔵"; if (s === "간조") return "⚪"; if (s === "창조중") return "🔼"; return "🔽" }
 
     return <div>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
         <div style={S.secT}>🌊 전국 실시간 해양정보</div>
         <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
           <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.25)" }}>
             {oceanUpd ? `🟡 시뮬레이션 · ${oceanUpd.toLocaleTimeString("ko-KR")}` : "로딩중..."} · 5분 자동갱신
           </span>
-          <button style={S.bo} onClick={fetchOcean}>↻ 새로고침</button>
+          <button style={S.bo(false)} onClick={fetchOcean}>↻ 새로고침</button>
         </div>
       </div>
 
       {/* Region filter */}
       <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
-        {regions.map(r => <button key={r} style={{ ...S.bo, ...(oceanRegion === r ? { background: "rgba(232,97,45,0.12)", color: "#E8612D" } : {}) }} onClick={() => setOceanRegion(r)}>{r}</button>)}
+        {regions.map(r => <button key={r} style={{ ...S.bo(oceanRegion === r), ...(oceanRegion === r ? { background: "rgba(232,97,45,0.12)", color: "#E8612D" } : {}) }} onClick={() => setOceanRegion(r)}>{r}</button>)}
       </div>
 
       {/* Wave height summary */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
         {[["잔잔 (0~1m)", "#4CAF50"], ["보통 (1~1.5m)", "#F07A4A"], ["약간 높음 (1.5~2m)", "#E8612D"], ["높음 (2m+)", "#ff3333"]].map(([label, color]) => {
           const count = filtered.filter(s => { const v = Number(s.waveHeight); if (color === "#4CAF50") return v < 1; if (color === "#F07A4A") return v >= 1 && v < 1.5; if (color === "#E8612D") return v >= 1.5 && v < 2; return v >= 2 }).length
           return <div key={label} style={S.c}>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{label}</div>
             <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>곳</span></div>
           </div>
         })}
       </div>
 
       {/* Station cards */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
         {filtered.map(st => <div key={st.code} style={S.c}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
             <div>
               <span style={{ fontSize: 13, fontWeight: 700 }}>{st.name}</span>
               <span style={S.tag}>{st.region}</span>
             </div>
             <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{getTideIcon(st.tideStatus)} {st.tideStatus}</span>
           </div>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
             <div style={{ background: "rgba(255,255,255,0.015)", borderRadius: 7, padding: "6px 8px", textAlign: "center" }}>
 
EOF
)
