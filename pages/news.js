import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"

// 주요 수산물 뉴스 소스
const NEWS_SOURCES = [
  { id: "mof", name: "해양수산부", icon: "🏛️", url: "https://www.mof.go.kr/list.do?menuKey=376&boardKey=10", color: "#E8612D" },
  { id: "kfta", name: "한국수산무역협회", icon: "🐟", url: "https://www.kfta.net", color: "#00a651" },
  { id: "nfqs", name: "국립수산물품질관리원", icon: "🔬", url: "https://www.nfqs.go.kr", color: "#ff8c00" },
  { id: "impfood", name: "수입식품정보마루", icon: "📦", url: "https://impfood.mfds.go.kr", color: "#e91e63" },
  { id: "kfish", name: "수산물수출정보포털", icon: "🌏", url: "https://www.kfishinfo.co.kr", color: "#9c27b0" },
  { id: "fta", name: "FTA 포털", icon: "📊", url: "https://www.customs.go.kr/ftaportalkor/main.do", color: "#ff5722" },
]

// 시뮬레이션 뉴스 데이터 (실제 배포 시 API/RSS 연동)
const SAMPLE_NEWS = [
  { id: 1, source: "mof", title: "2026년 수산식품 수출 목표 35억 달러 설정… 김·참치·굴 집중 육성", date: "2026-03-24", category: "정책", important: true },
  { id: 2, source: "impfood", title: "일본산 수입식품 방사능검사 결과 (2026.3.13~3.19) — 전량 적합", date: "2026-03-20", category: "검역", important: true },
  { id: 3, source: "kfta", title: "2026년 1분기 TRQ 할당관세 입찰 결과 공고", date: "2026-03-19", category: "관세", important: true },
  { id: 4, source: "fta", title: "RCEP 4년차 관세인하 적용… 일본산 수산물 세율 변동 안내", date: "2026-03-18", category: "FTA", important: true },
  { id: 5, source: "mof", title: "저수온 경보 해제… 남해안 양식장 피해 복구 지원 확대", date: "2026-03-17", category: "어황" },
  { id: 6, source: "nfqs", title: "중국산 냉동 오징어 잔류약물 기준 초과 — 수입금지 조치", date: "2026-03-16", category: "검역", important: true },
  { id: 7, source: "kfish", title: "EU 포장 규제 변화, 수산물 수출업계 체크할 핵심 사항", date: "2026-03-15", category: "수출규제" },
  { id: 8, source: "mof", title: "2025년 K-씨푸드 수출 33.3억 달러 역대 최대… 김 11.3억 달러", date: "2026-03-14", category: "통계" },
  { id: 9, source: "impfood", title: "해외제조업소 등록 시스템 개선 — 온라인 등록 절차 간소화", date: "2026-03-13", category: "제도" },
  { id: 10, source: "kfta", title: "냉동새우 수입량 전년 대비 12% 증가… 동남아산 비중 확대", date: "2026-03-12", category: "통계" },
  { id: 11, source: "fta", title: "한-중 FTA 11년차 관세 양허 일정 안내 (수산물 포함)", date: "2026-03-11", category: "FTA" },
  { id: 12, source: "mof", title: "2026년 스마트 수산양식 기술보급 사업 공고… 최대 3억원 지원", date: "2026-03-10", category: "지원사업" },
  { id: 13, source: "nfqs", title: "원산지 표시 위반 단속 강화 — 중국산 '국내산 둔갑' 주의", date: "2026-03-09", category: "규제" },
  { id: 14, source: "kfish", title: "베트남 외식시장 공략법 — 수산물 수출 유망 품목 분석", date: "2026-03-08", category: "시장분석" },
  { id: 15, source: "mof", title: "연간 폐업 100만 시대… 수산물 가공업 경영안정 지원 확대", date: "2026-03-07", category: "정책" },
]

const CATEGORIES = ["전체", "정책", "검역", "관세", "FTA", "통계", "어황", "수출규제", "제도", "지원사업", "규제", "시장분석"]

export default function NewsPage() {
  const [news, setNews] = useState(SAMPLE_NEWS)
  const [filter, setFilter] = useState("전체")
  const [srcFilter, setSrcFilter] = useState("all")

  const filtered = news.filter(n => {
    if (filter !== "전체" && n.category !== filter) return false
    if (srcFilter !== "all" && n.source !== srcFilter) return false
    return true
  })

  const important = news.filter(n => n.important)

  const S = {
    app: { fontFamily: "'Pretendard',sans-serif", background: "#2B3539", color: "#E8E4DF", minHeight: "100vh", fontSize: 14 },
    hdr: { background: "#242D31", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52, flexWrap: "wrap", gap: 8 },
    mn: { maxWidth: 1160, margin: "0 auto", padding: "16px 20px" },
    c: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 15 },
    bo: (a) => ({ padding: "5px 11px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: a ? "rgba(232,97,45,0.12)" : "transparent", color: a ? "#E8612D" : "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", fontWeight: a ? 600 : 400 }),
  }

  const getCatColor = (cat) => {
    const colors = { "정책": "#E8612D", "검역": "#ff5050", "관세": "#ffd666", "FTA": "#4CAF50", "통계": "#bb86fc", "어황": "#03dac6", "수출규제": "#ff8c00", "제도": "#64b5f6", "지원사업": "#81c784", "규제": "#e57373", "시장분석": "#ce93d8" }
    return colors[cat] || "rgba(255,255,255,0.3)"
  }

  return <div style={S.app}>
    <Head><title>수산물 뉴스 - Bay Works</title></Head>

    <main style={S.mn}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📰 수산물 수출입 뉴스</h1>

      {/* Important alerts */}
      {important.length > 0 && <div style={{ ...S.c, marginBottom: 16, borderColor: "rgba(255,80,80,0.15)", background: "rgba(255,50,50,0.03)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#ff5050", marginBottom: 10 }}>🔴 주요 속보 · 알림</div>
        {important.slice(0, 3).map(n => {
          const src = NEWS_SOURCES.find(s => s.id === n.source)
          return <div key={n.id} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>{src?.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{n.title}</span>
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
          {NEWS_SOURCES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
      </div>

      {/* News list */}
      <div style={S.c}>
        {filtered.map(n => {
          const src = NEWS_SOURCES.find(s => s.id === n.source)
          return <div key={n.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "flex-start" }}>
            <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{src?.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: src?.color, fontWeight: 600 }}>{src?.name}</span>
                <span style={{ fontSize: 10, color: getCatColor(n.category), background: `${getCatColor(n.category)}15`, padding: "1px 7px", borderRadius: 10 }}>{n.category}</span>
                {n.important && <span style={{ fontSize: 9, color: "#ff5050", background: "rgba(255,50,50,0.1)", padding: "1px 6px", borderRadius: 10 }}>중요</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{n.title}</div>
            </div>
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", flexShrink: 0 }}>{n.date}</span>
          </div>
        })}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.2)" }}>조건에 맞는 뉴스가 없습니다.</div>}
      </div>

      <div style={{ ...S.c, marginTop: 16, padding: 12, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
        💡 현재 샘플 뉴스가 표시됩니다. 실제 뉴스 자동수집을 위해 <code style={{ color: "#ffd666" }}>pages/api/news.js</code>를 추가하면 해양수산부, 수산무역협회, 식약처 등의 최신 뉴스가 자동으로 수집됩니다.
      </div>
    </main>
  </div>
}
