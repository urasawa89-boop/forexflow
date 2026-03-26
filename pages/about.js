import Head from "next/head"
import Link from "next/link"

const B = {
  orange: "#E8612D", orangeLight: "#F07A4A", orangeDim: "rgba(232,97,45,0.12)",
  bg: "#2B3539", bgCard: "rgba(255,255,255,0.04)", bgCardBorder: "rgba(255,255,255,0.07)",
  text: "#E8E4DF", textDim: "rgba(232,228,223,0.45)", textDimmer: "rgba(232,228,223,0.25)",
}

export default function About() {
  return (
    <>
      <Head>
        <title>Bay Works 소개 — 수산물 수입 실무 도구</title>
        <meta name="description" content="Bay Works는 수산물 수출입 실무자를 위한 올인원 도구입니다. 실시간 환율, HS코드 관세율 조회, 수입원가 계산기를 제공합니다." />
        <meta property="og:title" content="Bay Works 소개 — 수산물 수입 실무 도구" />
        <meta property="og:description" content="수산물 수출입 실무자를 위한 올인원 도구. 환율, 관세, 원가계산." />
      </Head>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginBottom: 20 }}>Bay Works 소개</h1>

        <div style={{ background: B.bgCard, border: `1px solid ${B.bgCardBorder}`, borderRadius: 12, padding: "24px 28px" }}>
          {/* 미션 */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: B.orange, marginBottom: 10 }}>
              수산물 수입, 더 쉽고 정확하게
            </h2>
            <p style={{ fontSize: 14, color: "rgba(232,228,223,0.8)", lineHeight: 1.8, margin: 0 }}>
              Bay Works는 수산물 수출입 실무자를 위한 올인원 도구입니다.
              환율 확인부터 관세율 조회, 수입원가 계산, 필요 서류 체크까지 —
              수입 업무에 필요한 정보를 한 곳에서 빠르게 확인할 수 있습니다.
            </p>
          </div>

          {/* 주요 기능 */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: B.text, marginBottom: 12 }}>주요 기능</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "💱", title: "실시간 수출입 환율", desc: "수출입은행 고시 기준, TTS/TTB 상세 환율" },
                { icon: "📋", title: "수산물 HS코드·관세율", desc: "67개 주요 품목 관세청 공식 데이터" },
                { icon: "🧮", title: "수입원가 계산기", desc: "부대비용 포함 정밀 원가 분석" },
                { icon: "📄", title: "수입서류 체크리스트", desc: "품목별 필수 서류 및 발급처 안내" },
                { icon: "🌊", title: "실시간 해양정보", desc: "전국 15개 관측소 파고·수온·조위" },
                { icon: "📰", title: "수산물 뉴스", desc: "정책·검역·관세 관련 최신 뉴스" },
              ].map((f, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.015)", borderRadius: 9, padding: "12px 14px", border: `1px solid rgba(255,255,255,0.03)` }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: B.text, marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 11.5, color: B.textDim }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 데이터 출처 */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: B.text, marginBottom: 8 }}>데이터 출처</h2>
            <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.8, margin: 0 }}>
              Bay Works의 데이터는 다음 공식 기관의 정보를 기반으로 합니다.
              환율은 한국수출입은행 고시 기준, 관세율은 관세청 품목별 관세율표(2026.02.11 기준),
              해양정보는 국립해양조사원 바다누리 서비스를 활용합니다.
              모든 데이터는 참고용이며, 실제 거래 시에는 반드시 해당 기관에서 최종 확인하시기 바랍니다.
            </p>
          </div>

          {/* 문의 */}
          <div style={{
            background: B.orangeDim, border: `1px solid rgba(232,97,45,0.2)`,
            borderRadius: 10, padding: "16px 20px",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 6 }}>문의 및 제안</div>
            <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", margin: "0 0 8px", lineHeight: 1.6 }}>
              서비스 개선 제안, 데이터 오류 신고, 제휴 문의 등은 아래로 연락해 주세요.
            </p>
            <a href="mailto:bayworks.contact@gmail.com" style={{ color: B.orange, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              bayworks.contact@gmail.com
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
