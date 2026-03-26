import Head from "next/head"
import { useState } from "react"

const B = {
  orange: "#E8612D", orangeLight: "#F07A4A", orangeDim: "rgba(232,97,45,0.12)",
  bg: "#2B3539", bgCard: "rgba(255,255,255,0.04)", bgCardBorder: "rgba(255,255,255,0.07)",
  text: "#E8E4DF", textDim: "rgba(232,228,223,0.45)", textDimmer: "rgba(232,228,223,0.25)",
}

export default function Contact() {
  const [sent, setSent] = useState(false)

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${B.bgCardBorder}`, background: "rgba(255,255,255,0.03)",
    color: B.text, fontSize: 13, outline: "none", boxSizing: "border-box",
  }

  return (
    <>
      <Head>
        <title>문의하기 — Bay Works</title>
        <meta name="description" content="Bay Works에 대한 문의, 제안, 제휴 요청을 보내주세요." />
      </Head>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginBottom: 6 }}>문의하기</h1>
        <p style={{ fontSize: 13, color: B.textDim, marginBottom: 24 }}>
          서비스 관련 문의, 데이터 오류 신고, 제휴 제안 등을 보내주세요.
        </p>

        <div style={{ background: B.bgCard, border: `1px solid ${B.bgCardBorder}`, borderRadius: 12, padding: "24px 28px" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: B.text, marginBottom: 8 }}>메일이 준비되었습니다</div>
              <p style={{ fontSize: 13, color: B.textDim }}>이메일 앱에서 내용을 확인하고 전송해주세요.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, color: B.textDim, marginBottom: 4, fontWeight: 500 }}>문의 유형</label>
                <select id="contact-type" style={{ ...inp, background: B.bg }}>
                  <option value="일반문의">일반 문의</option>
                  <option value="데이터오류">데이터 오류 신고</option>
                  <option value="기능제안">기능 제안</option>
                  <option value="제휴문의">제휴 / 광고 문의</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, color: B.textDim, marginBottom: 4, fontWeight: 500 }}>이름 (선택)</label>
                <input id="contact-name" type="text" style={inp} placeholder="이름 또는 회사명" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, color: B.textDim, marginBottom: 4, fontWeight: 500 }}>회신 이메일</label>
                <input id="contact-email" type="email" style={inp} placeholder="your@email.com" />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, color: B.textDim, marginBottom: 4, fontWeight: 500 }}>내용</label>
                <textarea id="contact-msg" style={{ ...inp, minHeight: 120, resize: "vertical" }} placeholder="문의 내용을 작성해주세요." />
              </div>

              <button
                onClick={() => {
                  const t = document.getElementById("contact-type").value
                  const n = document.getElementById("contact-name").value
                  const e = document.getElementById("contact-email").value
                  const m = document.getElementById("contact-msg").value
                  const subject = `[Bay Works] ${t}${n ? " - " + n : ""}`
                  const body = `문의 유형: ${t}\n이름: ${n || "미입력"}\n회신 이메일: ${e || "미입력"}\n\n내용:\n${m}`
                  window.location.href = `mailto:bayworks.contact@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  setSent(true)
                }}
                style={{
                  width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg,${B.orange},${B.orangeLight})`,
                  color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}
              >
                이메일로 보내기
              </button>

              <div style={{ marginTop: 14, textAlign: "center" }}>
                <span style={{ fontSize: 12, color: B.textDimmer }}>또는 직접 이메일: </span>
                <a href="mailto:bayworks.contact@gmail.com" style={{ fontSize: 12, color: B.orange, textDecoration: "none" }}>
                  bayworks.contact@gmail.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
