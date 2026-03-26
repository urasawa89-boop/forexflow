import Head from "next/head"
import Link from "next/link"
import { getGuideList, getGuideBySlug } from "../../lib/notion"
import fallbackGuides from "../../data/guides.json"

const B = {
  orange: "#E8612D", orangeLight: "#F07A4A", orangeDim: "rgba(232,97,45,0.12)",
  bg: "#2B3539", bgCard: "rgba(255,255,255,0.04)", bgCardBorder: "rgba(255,255,255,0.07)",
  text: "#E8E4DF", textDim: "rgba(232,228,223,0.45)", textDimmer: "rgba(232,228,223,0.25)",
}

const catColors = {
  "관세": "#ffd666", "절차": "#42A5F5", "FTA": "#4CAF50", "실무팁": "#bb86fc",
}

export async function getStaticPaths() {
  let slugs = []

  // Notion에서 slug 목록 가져오기
  try {
    const guides = await getGuideList()
    slugs = guides.map(g => g.slug).filter(Boolean)
  } catch (err) {
    console.error("getStaticPaths Notion error:", err)
  }

  // JSON 폴백 slug도 추가
  const jsonSlugs = fallbackGuides.filter(g => g.published).map(g => g.slug)
  const allSlugs = [...new Set([...slugs, ...jsonSlugs])]

  return {
    paths: allSlugs.map(slug => ({ params: { slug } })),
    fallback: "blocking", // 새 글 추가 시 자동 생성
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  let guide = null
  let otherGuides = []

  // Notion에서 시도
  try {
    guide = await getGuideBySlug(slug)
    const allGuides = await getGuideList()
    otherGuides = allGuides.filter(g => g.slug !== slug).slice(0, 3)
  } catch (err) {
    console.error("getStaticProps Notion error:", err)
  }

  // Notion 실패 시 JSON 폴백
  if (!guide) {
    const fbGuide = fallbackGuides.find(g => g.slug === slug && g.published)
    if (fbGuide) {
      guide = fbGuide
      otherGuides = fallbackGuides.filter(g => g.published && g.slug !== slug).slice(0, 3)
    }
  }

  if (!guide) {
    return { notFound: true }
  }

  return {
    props: { guide, otherGuides },
    revalidate: 60,
  }
}

function ContentBlock({ block }) {
  if (block.type === "heading") {
    return <h2 style={{ fontSize: 17, fontWeight: 700, color: B.text, margin: "28px 0 12px", borderLeft: `3px solid ${B.orange}`, paddingLeft: 12 }}>{block.text}</h2>
  }
  if (block.type === "paragraph") {
    return <p style={{ fontSize: 14, color: "rgba(232,228,223,0.8)", lineHeight: 1.8, margin: "0 0 14px" }}>{block.text}</p>
  }
  if (block.type === "list") {
    return (
      <ul style={{ margin: "0 0 14px", paddingLeft: 20 }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ fontSize: 13.5, color: "rgba(232,228,223,0.75)", lineHeight: 1.8, marginBottom: 4 }}>{item}</li>
        ))}
      </ul>
    )
  }
  if (block.type === "list_item") {
    return (
      <div style={{ display: "flex", gap: 8, marginBottom: 4, paddingLeft: 8 }}>
        <span style={{ color: B.orange }}>•</span>
        <span style={{ fontSize: 13.5, color: "rgba(232,228,223,0.75)", lineHeight: 1.8 }}>{block.text}</span>
      </div>
    )
  }
  if (block.type === "callout") {
    return (
      <div style={{
        background: B.orangeDim, border: `1px solid rgba(232,97,45,0.2)`,
        borderRadius: 10, padding: "12px 16px", margin: "14px 0",
        fontSize: 13.5, color: "rgba(232,228,223,0.8)", lineHeight: 1.7,
      }}>{block.text}</div>
    )
  }
  if (block.type === "quote") {
    return (
      <blockquote style={{
        borderLeft: `3px solid rgba(232,228,223,0.15)`, paddingLeft: 14, margin: "14px 0",
        fontSize: 13.5, color: B.textDim, lineHeight: 1.7, fontStyle: "italic",
      }}>{block.text}</blockquote>
    )
  }
  if (block.type === "divider") {
    return <hr style={{ border: "none", borderTop: `1px solid ${B.bgCardBorder}`, margin: "20px 0" }} />
  }
  if (block.type === "cta") {
    return (
      <div style={{
        background: B.orangeDim, border: `1px solid rgba(232,97,45,0.2)`,
        borderRadius: 10, padding: "14px 18px", margin: "20px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10,
      }}>
        <span style={{ fontSize: 13, color: B.text }}>{block.text}</span>
        <Link href={block.link || "/"} style={{
          padding: "7px 16px", borderRadius: 7,
          background: `linear-gradient(135deg,${B.orange},${B.orangeLight})`,
          color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none",
        }}>바로가기 →</Link>
      </div>
    )
  }
  return null
}

export default function GuideDetail({ guide, otherGuides }) {
  if (!guide) return null
  const color = catColors[guide.category] || B.orange

  return (
    <>
      <Head>
        <title>{guide.title} — Bay Works</title>
        <meta name="description" content={guide.description} />
        <meta property="og:title" content={`${guide.title} — Bay Works`} />
        <meta property="og:description" content={guide.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://bayworksindex.com/guide/${guide.slug}`} />
        {guide.tags && <meta name="keywords" content={guide.tags.join(", ")} />}
      </Head>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 20px" }}>
        <Link href="/guide" style={{ fontSize: 12, color: B.textDim, textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
          ← 가이드 목록
        </Link>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{
              fontSize: 10.5, color, background: `${color}18`,
              padding: "2px 8px", borderRadius: 10, fontWeight: 500,
            }}>{guide.category}</span>
            <span style={{ fontSize: 11, color: B.textDimmer }}>{guide.date}</span>
            {guide.readTime > 0 && <span style={{ fontSize: 11, color: B.textDimmer }}>· 읽는 시간 {guide.readTime}분</span>}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: B.text, lineHeight: 1.4, margin: "0 0 10px" }}>
            {guide.title}
          </h1>
          <p style={{ fontSize: 13.5, color: B.textDim, lineHeight: 1.6, margin: 0 }}>
            {guide.description}
          </p>
          {guide.tags && guide.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {guide.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10, color: B.textDim,
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 7px", borderRadius: 4,
                }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: B.bgCard, border: `1px solid ${B.bgCardBorder}`,
          borderRadius: 12, padding: "24px 28px",
        }}>
          {guide.content && guide.content.map((block, i) => <ContentBlock key={i} block={block} />)}
        </div>

        {otherGuides && otherGuides.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: B.text }}>다른 가이드</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
              {otherGuides.map(g => (
                <Link key={g.slug} href={`/guide/${g.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    background: B.bgCard, border: `1px solid ${B.bgCardBorder}`,
                    borderRadius: 9, padding: 14, cursor: "pointer",
                  }}>
                    <span style={{ fontSize: 10, color: catColors[g.category] || B.orange }}>{g.category}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: B.text, marginTop: 4, lineHeight: 1.4 }}>{g.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
