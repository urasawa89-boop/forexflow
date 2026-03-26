import Head from "next/head"

const B = {
  bg: "#2B3539", bgCard: "rgba(255,255,255,0.04)", bgCardBorder: "rgba(255,255,255,0.07)",
  text: "#E8E4DF", textDim: "rgba(232,228,223,0.45)", orange: "#E8612D",
}

export default function Privacy() {
  return (
    <>
      <Head>
        <title>개인정보처리방침 — Bay Works</title>
        <meta name="description" content="Bay Works 개인정보처리방침. 수산물 수입 실무 도구 서비스의 개인정보 수집, 이용, 보호에 관한 안내." />
      </Head>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginBottom: 20 }}>개인정보처리방침</h1>
        <div style={{ background: B.bgCard, border: `1px solid ${B.bgCardBorder}`, borderRadius: 12, padding: "24px 28px" }}>
          {[
            { title: "1. 개인정보의 수집 및 이용 목적", body: "Bay Works(이하 '서비스')는 다음의 목적을 위해 최소한의 개인정보를 수집·이용합니다.\n• 환율 알림 서비스 제공 (이메일 주소)\n• 서비스 이용 통계 분석 및 개선\n• 문의 응대 및 공지사항 전달" },
            { title: "2. 수집하는 개인정보 항목", body: "• 필수항목: 없음 (비회원으로 대부분의 서비스 이용 가능)\n• 선택항목: 이메일 주소 (환율 알림 등록 시)\n• 자동 수집: 접속 로그, 쿠키, 접속 IP, 서비스 이용 기록" },
            { title: "3. 개인정보의 보유 및 이용 기간", body: "이용자의 개인정보는 수집·이용 목적이 달성된 후에는 지체 없이 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.\n• 전자상거래법에 따른 계약 또는 청약철회 등에 관한 기록: 5년\n• 접속에 관한 기록: 3개월" },
            { title: "4. 개인정보의 제3자 제공", body: "서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의해 요구되는 경우는 예외로 합니다." },
            { title: "5. 쿠키(Cookie)의 사용", body: "서비스는 이용자의 편의를 위해 쿠키를 사용합니다. 쿠키는 웹사이트 이용 정보를 저장하여 맞춤 서비스를 제공하는 데 활용됩니다. 이용자는 브라우저 설정을 통해 쿠키 사용을 거부할 수 있습니다." },
            { title: "6. 광고 서비스", body: "서비스는 Google AdSense 등 제3자 광고 서비스를 사용할 수 있습니다. 이러한 광고 서비스 제공자는 사용자의 관심사에 맞는 광고를 표시하기 위해 쿠키를 사용할 수 있습니다. 자세한 내용은 Google의 개인정보처리방침(policies.google.com)을 참조하세요." },
            { title: "7. 개인정보 보호책임자", body: "서비스명: Bay Works (bayworksindex.com)\n문의: bayworks.contact@gmail.com\n\n본 방침은 2026년 3월 25일부터 시행됩니다." },
          ].map((sec, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: B.text, marginBottom: 8 }}>{sec.title}</h2>
              <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
