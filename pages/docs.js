import { useState } from "react"
import Head from "next/head"
import Link from "next/link"

// 수산물 수입 상태별 필요서류 DB
const IMPORT_DOCS = {
  live: {
    label: "활어 (살아있는 수산물)",
    hs: "0301",
    docs: [
      { name: "수입신고서", required: true, desc: "수입식품안전관리 특별법 시행규칙 별지 제25호서식", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "수입수산동물 검역증명서", required: true, desc: "수산생물질병관리법 제22조 — 수출국 정부기관 발급", url: "https://www.nfqs.go.kr", site: "국립수산물품질관리원" },
      { name: "수입식품등 수입신고확인증", required: true, desc: "지방식약청 발급 (서류/정밀검사 후)", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "위생증명서 (Health Certificate)", required: true, desc: "수출국 정부기관 발급, 위생 상태 증명", url: "https://impfood.mfds.go.kr/CFCII04F01", site: "수입검사 증명서제출 안내" },
      { name: "원산지증명서 (C/O)", required: false, desc: "FTA 특혜관세 적용 시 필수 (한중FTA, RCEP 등)", url: "https://www.customs.go.kr/ftaportalkor/main.do", site: "FTA 포털" },
      { name: "해외제조업소 등록확인서", required: true, desc: "수출국 제조업소 사전 등록 필수", url: "https://impfood.mfds.go.kr/CFAAA01F01", site: "해외제조업소 등록" },
      { name: "상업송장 (Commercial Invoice)", required: true, desc: "품목, 수량, 단가, 총액 기재", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "선하증권 (B/L)", required: true, desc: "해상운송 화물 수령증", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "포장명세서 (Packing List)", required: true, desc: "포장 단위, 중량, 용적 명세", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "수입식품판매업 영업신고증", required: true, desc: "관할 구청에서 사전 발급", url: "https://www.gov.kr", site: "정부24" },
      { name: "사업자등록증 사본", required: true, desc: "관할 세무서 발급", url: "https://www.hometax.go.kr", site: "홈택스" },
    ],
    notes: ["활어 수입 시 수산생물질병관리법에 따른 검역이 반드시 선행되어야 합니다.", "첫 거래 시 정밀검사 실시로 상당 기간 소요될 수 있습니다.", "통관가능세관이 지정되어 있으므로 사전 확인 필요합니다."]
  },
  fresh: {
    label: "신선·냉장 수산물",
    hs: "0302",
    docs: [
      { name: "수입신고서", required: true, desc: "수입식품안전관리 특별법 시행규칙 별지 제25호서식", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "수입식품등 수입신고확인증", required: true, desc: "지방식약청 발급", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "위생증명서 (Health Certificate)", required: true, desc: "수출국 정부기관 발급", url: "https://impfood.mfds.go.kr/CFCII04F01", site: "증명서 안내" },
      { name: "원산지증명서 (C/O)", required: false, desc: "FTA 특혜관세 적용 시 필수", url: "https://www.customs.go.kr/ftaportalkor/main.do", site: "FTA 포털" },
      { name: "해외제조업소 등록확인서", required: true, desc: "수출국 제조업소 사전 등록", url: "https://impfood.mfds.go.kr/CFAAA01F01", site: "해외제조업소 등록" },
      { name: "상업송장 (Commercial Invoice)", required: true, desc: "품목, 수량, 단가, 총액", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "선하증권 (B/L)", required: true, desc: "해상운송 화물 수령증", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "포장명세서 (Packing List)", required: true, desc: "포장 단위, 중량, 용적", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "수입식품판매업 영업신고증", required: true, desc: "관할 구청 사전 발급", url: "https://www.gov.kr", site: "정부24" },
    ],
    notes: ["신선·냉장 수산물은 입항지 세관 또는 냉장·냉동창고가 있는 내륙지세관에서 통관합니다.", "도착 예정일 5일 전부터 사전신고 가능합니다."]
  },
  frozen: {
    label: "냉동 수산물",
    hs: "0303~0304",
    docs: [
      { name: "수입신고서", required: true, desc: "수입식품안전관리 특별법 시행규칙 별지 제25호서식", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "수입식품등 수입신고확인증", required: true, desc: "지방식약청 발급", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "위생증명서 (Health Certificate)", required: true, desc: "수출국 정부기관 발급 (협약 체결국)", url: "https://impfood.mfds.go.kr/CFCII04F01", site: "증명서 안내" },
      { name: "원산지증명서 (C/O)", required: false, desc: "FTA 특혜관세 적용 시 필수", url: "https://www.customs.go.kr/ftaportalkor/main.do", site: "FTA 포털" },
      { name: "해외제조업소 등록확인서", required: true, desc: "수출국 제조업소 사전 등록", url: "https://impfood.mfds.go.kr/CFAAA01F01", site: "해외제조업소 등록" },
      { name: "상업송장 (Commercial Invoice)", required: true, desc: "품목, 수량, 단가, 총액", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "선하증권 (B/L)", required: true, desc: "해상운송 화물 수령증", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "포장명세서 (Packing List)", required: true, desc: "포장 단위, 중량, 용적", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
      { name: "수입식품판매업 영업신고증", required: true, desc: "관할 구청 사전 발급", url: "https://www.gov.kr", site: "정부24" },
    ],
    notes: ["냉동 수산물은 냉장·냉동창고가 있는 세관에서만 통관 가능합니다.", "B/L 단위로 수입신고해야 합니다."]
  },
  dried: {
    label: "건조·염장·훈제 수산물",
    hs: "0305",
    docs: [
      { name: "수입신고서", required: true, desc: "별지 제25호서식", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "수입식품등 수입신고확인증", required: true, desc: "지방식약청 발급", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "위생증명서", required: true, desc: "수출국 정부기관 발급 (해당국)", url: "https://impfood.mfds.go.kr/CFCII04F01", site: "증명서 안내" },
      { name: "원산지증명서 (C/O)", required: false, desc: "FTA 적용 시", url: "https://www.customs.go.kr/ftaportalkor/main.do", site: "FTA 포털" },
      { name: "해외제조업소 등록확인서", required: true, desc: "사전 등록", url: "https://impfood.mfds.go.kr/CFAAA01F01", site: "해외제조업소 등록" },
      { name: "한글표시 라벨", required: true, desc: "제품명, 원산지, 내용량, 소비기한 등 한글 표시", url: "https://www.foodsafetykorea.go.kr", site: "식품안전나라" },
      { name: "상업송장 / B/L / 포장명세서", required: true, desc: "기본 통관서류", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
    ],
    notes: ["염수장한 것은 통관가능세관이 지정되어 있습니다.", "한글 라벨 표시가 반드시 필요합니다."]
  },
  crustacean: {
    label: "갑각류 (새우, 게, 랍스터 등)",
    hs: "0306",
    docs: [
      { name: "수입신고서", required: true, desc: "별지 제25호서식", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "수입수산동물 검역증명서", required: true, desc: "활 갑각류의 경우 필수 — 수산생물질병관리법", url: "https://www.nfqs.go.kr", site: "국립수산물품질관리원" },
      { name: "수입식품등 수입신고확인증", required: true, desc: "지방식약청 발급", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "위생증명서", required: true, desc: "수출국 정부기관 발급", url: "https://impfood.mfds.go.kr/CFCII04F01", site: "증명서 안내" },
      { name: "원산지증명서 (C/O)", required: false, desc: "FTA 적용 시", url: "https://www.customs.go.kr/ftaportalkor/main.do", site: "FTA 포털" },
      { name: "해외제조업소 등록확인서", required: true, desc: "사전 등록", url: "https://impfood.mfds.go.kr/CFAAA01F01", site: "해외제조업소 등록" },
      { name: "상업송장 / B/L / 포장명세서", required: true, desc: "기본 통관서류", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
    ],
    notes: ["활 갑각류(새우, 게 등) 수입 시 수산생물 검역이 필수입니다.", "냉동 새우는 검역 대상에서 제외될 수 있으나 식품검사는 필수입니다."]
  },
  processed: {
    label: "조제·가공 수산물 (캔, 어묵 등)",
    hs: "1604~1605",
    docs: [
      { name: "수입신고서", required: true, desc: "별지 제25호서식", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "수입식품등 수입신고확인증", required: true, desc: "지방식약청 발급", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "해외제조업소 등록확인서", required: true, desc: "사전 등록 필수", url: "https://impfood.mfds.go.kr/CFAAA01F01", site: "해외제조업소 등록" },
      { name: "한글표시 라벨", required: true, desc: "제품명, 원재료, 소비기한, 영양성분 등", url: "https://www.foodsafetykorea.go.kr", site: "식품안전나라" },
      { name: "원산지증명서 (C/O)", required: false, desc: "FTA 적용 시", url: "https://www.customs.go.kr/ftaportalkor/main.do", site: "FTA 포털" },
      { name: "시험검사성적서", required: false, desc: "정밀검사 대상인 경우 국외시험기관 성적서", url: "https://impfood.mfds.go.kr", site: "수입식품정보마루" },
      { name: "상업송장 / B/L / 포장명세서", required: true, desc: "기본 통관서류", url: "https://unipass.customs.go.kr", site: "UNIPASS" },
    ],
    notes: ["가공식품은 한글 라벨 표시가 반드시 필요합니다.", "첫 수입 시 정밀검사 대상이 될 수 있습니다 (약 10일 소요)."]
  },
}

const USEFUL_SITES = [
  { name: "UNIPASS (관세청 전자통관)", url: "https://unipass.customs.go.kr", desc: "수입신고, HS코드 조회, 관세율 조회, 통관현황" },
  { name: "수입식품정보마루", url: "https://impfood.mfds.go.kr", desc: "수입신고서 작성, 해외제조업소 등록, 부적합 정보" },
  { name: "식품안전나라", url: "https://www.foodsafetykorea.go.kr", desc: "식품 기준·규격, 수입검사 정보" },
  { name: "국립수산물품질관리원", url: "https://www.nfqs.go.kr", desc: "수산물 검역, 품질인증, 원산지 표시" },
  { name: "FTA 포털 (관세청)", url: "https://www.customs.go.kr/ftaportalkor/main.do", desc: "FTA 세율 조회, 원산지증명서 발급, C/O 양식" },
  { name: "한국수산무역협회", url: "https://www.kfta.net", desc: "TRQ 할당관세 입찰, 수산물 수출입 통계" },
  { name: "수산물수출정보포털", url: "https://www.kfishinfo.co.kr", desc: "수출 절차, 비관세장벽 정보, 국가별 규제" },
  { name: "관세법령정보포털 CLIP", url: "https://unipass.customs.go.kr/clip/index.do", desc: "HS코드 분류, 관세율표, 품목분류 사전심사" },
  { name: "정부24", url: "https://www.gov.kr", desc: "수입식품판매업 영업신고, 각종 인허가" },
  { name: "홈택스", url: "https://www.hometax.go.kr", desc: "사업자등록, 부가세 신고" },
  { name: "한국무역협회 TradeNAVI", url: "https://tradenavi.or.kr", desc: "국가별 관세율 조회, 무역규제 정보" },
  { name: "무역통계 K-stat", url: "https://stat.kita.net", desc: "품목별/국가별 수출입 통계" },
]

export default function DocsPage() {
  const [selected, setSelected] = useState("live")
  const [checked, setChecked] = useState({})
  const cat = IMPORT_DOCS[selected]

  const toggle = (idx) => {
    const key = `${selected}_${idx}`
    setChecked(p => ({ ...p, [key]: !p[key] }))
  }

  const S = {
    app: { fontFamily: "'Pretendard',sans-serif", background: "#2B3539", color: "#E8E4DF", minHeight: "100vh", fontSize: 14 },
    hdr: { background: "#242D31", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
    mn: { maxWidth: 1160, margin: "0 auto", padding: "16px 20px" },
    c: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 15 },
    bo: (a) => ({ padding: "7px 14px", borderRadius: 7, border: `1px solid ${a ? "rgba(232,97,45,0.3)" : "rgba(255,255,255,0.07)"}`, background: a ? "rgba(232,97,45,0.12)" : "transparent", color: a ? "#E8612D" : "rgba(232,228,223,0.45)", fontSize: 12, cursor: "pointer", fontWeight: a ? 600 : 400 }),
  }

  return <div style={S.app}>
    <Head><title>수입서류 체크리스트 - Bay Works</title></Head>

    <main style={S.mn}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📋 수산물 수입신고 서류 체크리스트</h1>

      {/* Category selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(IMPORT_DOCS).map(([k, v]) =>
          <button key={k} style={S.bo(selected === k)} onClick={() => setSelected(k)}>{v.label}</button>
        )}
      </div>

      {/* Selected category info */}
      <div style={{ ...S.c, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{cat.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>HS코드 {cat.hs} 해당</div>
          </div>
          <div style={{ fontSize: 12, color: "#E8612D" }}>
            {cat.docs.filter((_, i) => checked[`${selected}_${i}`]).length} / {cat.docs.length} 완료
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(cat.docs.filter((_, i) => checked[`${selected}_${i}`]).length / cat.docs.length) * 100}%`, background: "linear-gradient(90deg,#E8612D,#F07A4A)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>

        {/* Document list */}
        {cat.docs.map((doc, i) => {
          const key = `${selected}_${i}`
          const done = checked[key]
          return <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div onClick={() => toggle(i)} style={{ width: 20, height: 20, borderRadius: 5, border: done ? "none" : "2px solid rgba(255,255,255,0.15)", background: done ? "#4CAF50" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
              {done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1, opacity: done ? 0.5 : 1, textDecoration: done ? "line-through" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                {doc.name}
                {doc.required ? <span style={{ color: "#ff5050", fontSize: 10, marginLeft: 6 }}>필수</span> : <span style={{ color: "#ffd666", fontSize: 10, marginLeft: 6 }}>선택</span>}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{doc.desc}</div>
            </div>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, color: "#E8612D", textDecoration: "none", whiteSpace: "nowrap", padding: "4px 10px", border: "1px solid rgba(0,100,255,0.2)", borderRadius: 6, flexShrink: 0 }}>
              {doc.site} →
            </a>
          </div>
        })}
      </div>

      {/* Notes */}
      {cat.notes && <div style={{ ...S.c, marginBottom: 16, background: "rgba(255,180,0,0.04)", borderColor: "rgba(255,180,0,0.1)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#ffd666", marginBottom: 8 }}>⚠ 참고사항</div>
        {cat.notes.map((n, i) => <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4, paddingLeft: 12 }}>• {n}</div>)}
      </div>}

      {/* Useful sites */}
      <div style={S.c}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🔗 수출입 관련 주요 사이트</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {USEFUL_SITES.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.015)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.03)", textDecoration: "none" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#E8612D", marginBottom: 3 }}>{s.name}</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
          </a>)}
        </div>
      </div>
    </main>
  </div>
}
