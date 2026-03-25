import { useState, useEffect } from "react"
import Head from "next/head"

// 주요 수산물 뉴스 소스 (바로가기 링크)
const NEWS_SOURCES = [
  { id: "mof", name: "해양수산부", icon: "🏛️", url: "https://www.mof.go.kr/list.do?menuKey=376&boardKey=10", color: "#E8612D" },
  { id: "kfta", name: "한국수산무역협회", icon: "🐟", url: "https://www.kfta.net", color: "#00a651" },
  { id: "nfqs", name: "국립수산물품질관리원", icon: "🔬", url: "https://www.nfqs.go.kr", color: "#ff8c00" },
  { id: "impfood", name: "수입식품정보마루", icon: "📦", url: "https://impfood.mfds.go.kr", color: "#e91e63" },
  { id: "kfish", name: "수산물수출정보포털", icon: "🌏", url: "https://www.kfishinfo.co.kr", color: "#9c27b0" },
  { id: "fta", name: "FTA 포털", icon: "📊", url: "https://www.customs.go.kr/ftaportalkor/main.do", color: "#ff5722" },
]

// API 실패 시 폴백용 샘플 데이터
const SAMPLE_NEWS = [
  { id: 1, source: "mof", sourceName: "해양수산부", title: "2026년 수산식품 수출 목표 35억 달러 설정… 김·참치·굴 집중 육성", date: "2026-03-24", category: "정책", important: true },
  { id: 2, source: "naver", sourceName: "네이버뉴스", title: "일본산 수입식품 방사능검사 결과 (2026.3.13~3.19) — 전량 적합", date: "2026-03-20", category: "검역", important: true },
  { id: 3, source: "naver", sourceName: "네이버뉴스", title: "2026년 1분기 TRQ 할당관세 입찰 결과 공고", date: "2026-03-19", category: "관세", important: true },
  { id: 4, source: "naver", sourceName: "네이버뉴스", title: "RCEP 4년차 관세인하 적용… 일본산 수산물 세율 변동 안내", date: "2026-03-18", category: "관세", important: true },
  { id: 5, source: "mof", sourceName: "해양수산부", title: "저수온 경보 해제… 남해안 양식장 피해 복구 지원 확대", date: "2026-03-17", category: "어황" },
  { id: 6, source: "naver", sourceName: "네이버뉴스", title: "중국산 냉동 오징어 잔류약물 기준 초과 — 수입금지 조치", date: "2026-03-16", category: "검역", important: true },
  { id: 7, source: "naver", sourceName: "네이버뉴스", title: "EU 포장 규제 변화, 수산물 수출업계 체크할 핵심 사항", date: "2026-03-15", category: "수출" },
  { id: 8, source: "mof", sourceName: "해양수산부", title: "2025년 K-씨푸드 수출 33.3억 달러 역대 최대… 김 11.3억 달러", date: "2026-03-14", category: "통계" },
  { id: 9, source: "naver", sourceName: "네이버뉴스", title: "냉동새우 수입량 전년 대비 12% 증가… 동남아산 비중 확대", date: "2026-03-12", category: "통계" },
  { id: 10, source: "mof", sourceName: "해양수산부", title: "2026년 스마트 수산양식 기술보급 사업 공고… 최대 3억원 지원", date: "2026-03-10", category: "지원사업" },
]

const CATEGORIES = ["전체", "정책", "검역", "관세", "통계", "수출", "어황", "지원사업", "규제", "일반"]

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [filter, setFilter] = useState("전체")
  const [srcFilter, setSrcFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState("loading")

  // API에서 뉴스 가져오기
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news")
        const data = await res.json()
        if (data.success && data.news && data.news.length > 0) {
          setNews(data.news)
          setDataSource(`실시간 (네이버 ${data.sources?.naver || 0}건 + 해수부 ${data.sources?.mof || 0}건)`)
        } else {
          throw new Error("empty")
        }
      } catch {
        setNews(SAMPLE_NEWS)
        setDataSource("샘플 데이터 (API 키 설정 필요)")
      }
      setLoading(false)
    }
    fetchNews()
  }, [])

  const filtered = news.filter(n => {
    if (filter !== "전체" && n.category !== filter) return false
    if (srcFilter !== "all" && n.source !== srcFilter) return false
    return true
  })

  const important = news.filter(n => n.important)

  const S = {
    app: { fontFamily: "'Pretendard',sans-serif", background: "#2B3539", color: "#E8E4DF", minHeight: "100vh", fontSize: 14 },
    mn: { maxWidth: 1160, margin: "0 auto", padding: "16px 20px" },
    c: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 15 },
    bo: (a) => ({ padding: "5px 11px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: a ? "rgba(232,97,45,0.12)" : "transparent", color: a ? "#E8612D" : "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", fontWeight: a ? 600 : 400 }),
  }

  const getCatColor = (cat) => {
    const colors = { "정책": "#E8612D", "검역": "#ff5050", "관세": "#ffd666", "통계": "#bb86fc", "수출": "#4CAF50", "어황": "#03dac6", "지원사업": "#81c784", "규제": "#e57373", "일반": "rgba(255,255,255,0.3)" }
    return colors[cat] || "rgba(255,255,255,0.3)"
  }

  const getSourceInfo = (n) => {
    if (n.source === "mof") return { icon: "🏛️", color: "#E8612D", name: n.sourceName || "해양수산부" }
    if (n.source === "naver") return { icon: "📰", color: "#03C75A", name: n.sourceName || "네이버뉴스" }
    const src = NEWS_SOURCES.find(s => s.id === n.source)
    return { icon: src?.icon || "📰", color: src?.color || "#aaa", name: n.sourceName || src?.name || "기타" }
  }

  return <div style={S.app}>
    <Head><title>수산물 뉴스 - Bay Works</title></Head>

    <main style={S.mn}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>📰 수산물 수출입 뉴스</h1>
        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.25)" }}>
          {loading ? "⏳ 불러오는 중..." : `🟢 ${dataSource}`}
        </span>
      </div>

      {/* Important alerts */}
      {important.length > 0 && <div style={{ ...S.c, marginBottom: 16, borderColor: "rgba(255,80,80,0.15)", background: "rgba(255,50,50,0.03)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#ff5050", marginBottom: 10 }}>🔴 주요 속보 · 알림</div>
        {important.slice(0, 4).map(n => {
          const si = getSourceInfo(n)
          return <div key={n.id} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>{si.icon}</span>
              <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: "#E8E4DF", textDecoration: "none" }}>{n.title}</a>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{n.date}</span>
          </div>
        })}
      </div>}

      {/* News sources */}
      <div style={{ ...S.c, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📡 뉴스 소스 (클릭하면 해당 사이트로 이동)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {NEWS_SOURCES.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.015)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.03)", textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>바로가기 →</div>
            </div>
          </a>)}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => <button key={c} style={S.bo(filter === c)} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
        <select style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "#E8E4DF", fontSize: 11.5 }} value={srcFilter} onChange={e => setSrcFilter(e.target.value)}>
          <option value="all">모든 소스</option>
          <option value="mof">🏛️ 해양수산부</option>
          <option value="naver">📰 네이버뉴스</option>
        </select>
      </div>

      {/* News list */}
      <div style={S.c}>
        {loading && <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.3)" }}>⏳ 뉴스를 불러오는 중...</div>}
        {!loading && filtered.map(n => {
          const si = getSourceInfo(n)
          return <div key={n.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "flex-start" }}>
            <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{si.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: si.color, fontWeight: 600 }}>{si.name}</span>
                <span style={{ fontSize: 10, color: getCatColor(n.category), background: `${getCatColor(n.category)}15`, padding: "1px 7px", borderRadius: 10 }}>{n.category}</span>
                {n.important && <span style={{ fontSize: 9, color: "#ff5050", background: "rgba(255,50,50,0.1)", padding: "1px 6px", borderRadius: 10 }}>중요</span>}
              </div>
              {n.link ? (
                <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5, color: "#E8E4DF", textDecoration: "none" }}>{n.title}</a>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{n.title}</div>
              )}
              {n.description && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 700 }}>{n.description}</div>}
            </div>
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", flexShrink: 0 }}>{n.date}</span>
          </div>
        })}
        {!loading && filtered.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.2)" }}>조건에 맞는 뉴스가 없습니다.</div>}
      </div>

      {/* API 상태 안내 */}
      <div style={{ ...S.c, marginTop: 16, padding: 12, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
        💡 <strong>뉴스 자동수집 설정:</strong> <code style={{ color: "#ffd666" }}>pages/api/news.js</code>에서 네이버 API 키를 설정하면 수산물 관련 최신 뉴스가 자동 수집됩니다.
        키 발급: <a href="https://developers.naver.com" target="_blank" rel="noopener noreferrer" style={{ color: "#03C75A" }}>developers.naver.com</a> → 애플리케이션 등록 → 검색 API 선택
      </div>
    </main>
  </div>
}
