import Head from "next/head"
import Link from "next/link"
import { getGuideList } from "../../lib/notion"
import fallbackGuides from "../../data/guides.json"

const B = {
  orange: "#E8612D", orangeLight: "#F07A4A", orangeDim: "rgba(232,97,45,0.12)",
  bg: "#2B3539", bgCard: "rgba(255,255,255,0.04)", bgCardBorder: "rgba(255,255,255,0.07)",
  text: "#E8E4DF", textDim: "rgba(232,228,223,0.45)", textDimmer: "rgba(232,228,223,0.25)",
}

const catColors = {
  "관세": "#ffd666", "절차": "#42A5F5", "FTA": "#4CAF50", "실무팁": "#bb86fc",
}

export async function getStaticProps() {
  let guides = []
  try {
    guides = await getGuideList()
  } catch (err) {
    console.error("Notion fetch failed, using fallback:", err)
  }

  if (!guides || guides.length === 0) {
    guides = fallbackGuides.filter(g => g.published)
  }

  return {
    props: { guides },
    revalidate: 60,
  }
}

export default function GuidePage({ guides }) {
  return (
    <>
      <Head>
        <title>수산물 수입 가이드 — Bay Works</title>
        <meta name="description" content="수산물 수입 실무자를 위한 가이드. HS코드 조회, 관세율, 수입 절차, FTA 활용법, 수입원가 계산까지." />
        <meta property="og:title" content="수산물 수입 가이드 — Bay Works" />
        <meta property="og:description" content="수산물 수입 실무자를 위한 가이드. HS코드, 관세, 절차, FTA, 원가계산." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bayworksindex.com/guide" />
      </Head>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 20px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: B.text }}>
            수산물 수입 가이드
          </h1>
          <p style={{ fontSize: 13, color: B.textDim, margin: 0 }}>
            수입 실무에 필요한 관세, 절차, FTA, 원가계산 가이드를 제공합니다.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {guides.map(g => {
            const color = catColors[g.category] || B.orange
            return (
              <Link key={g.slug} href={`/guide/${g.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  background: B.bgCard,
                  border: `1px solid ${B.bgCardBorder}`,
                  borderRadius: 11,
                  padding: 18,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 10.5, color, background: `${color}18`,
                      padding: "2px 8px", borderRadius: 10, fontWeight: 500,
                    }}>{g.category}</span>
                    <span style={{ fontSize: 10.5, color: B.textDimmer }}>{g.date}</span>
                    {g.readTime > 0 && <span style={{ fontSize: 10.5, color: B.textDimmer }}>· {g.readTime}분</span>}
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: B.text, lineHeight: 1.4 }}>
                    {g.title}
                  </h2>
                  <p style={{ fontSize: 12.5, color: B.textDim, lineHeight: 1.6, margin: 0 }}>
                    {g.description}
                  </p>
                  {g.tags && g.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      {g.tags.slice(0, 4).map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, color: B.textDim,
                          background: "rgba(255,255,255,0.04)",
                          padding: "2px 7px", borderRadius: 4,
                        }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
