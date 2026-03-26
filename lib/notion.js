// lib/notion.js
// Notion API를 통해 가이드 콘텐츠를 가져오는 유틸리티

const NOTION_API = "https://api.notion.com/v1"
const NOTION_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = process.env.NOTION_DATABASE_ID

const headers = {
  "Authorization": `Bearer ${NOTION_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
}

// 데이터베이스에서 Published된 글 목록 가져오기
export async function getGuideList() {
  try {
    const res = await fetch(`${NOTION_API}/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: {
          property: "Published",
          checkbox: { equals: true },
        },
        sorts: [
          { property: "Date", direction: "descending" },
        ],
      }),
    })
    const data = await res.json()
    if (!data.results) return []

    return data.results.map(page => ({
      id: page.id,
      slug: getTextProp(page, "Slug"),
      title: getTitleProp(page),
      description: getTextProp(page, "Description"),
      category: getSelectProp(page, "Category"),
      date: getDateProp(page, "Date"),
      readTime: getNumberProp(page, "ReadTime"),
      published: true,
    }))
  } catch (err) {
    console.error("Notion getGuideList error:", err)
    return []
  }
}

// 개별 페이지의 블록(본문) 가져오기
export async function getGuideBlocks(pageId) {
  try {
    const res = await fetch(`${NOTION_API}/blocks/${pageId}/children?page_size=100`, {
      headers,
    })
    const data = await res.json()
    if (!data.results) return []

    return data.results.map(block => parseBlock(block)).filter(Boolean)
  } catch (err) {
    console.error("Notion getGuideBlocks error:", err)
    return []
  }
}

// slug로 페이지 찾기
export async function getGuideBySlug(slug) {
  try {
    const res = await fetch(`${NOTION_API}/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: {
          and: [
            { property: "Slug", rich_text: { equals: slug } },
            { property: "Published", checkbox: { equals: true } },
          ],
        },
      }),
    })
    const data = await res.json()
    if (!data.results || data.results.length === 0) return null

    const page = data.results[0]
    const blocks = await getGuideBlocks(page.id)

    return {
      id: page.id,
      slug: getTextProp(page, "Slug"),
      title: getTitleProp(page),
      description: getTextProp(page, "Description"),
      category: getSelectProp(page, "Category"),
      date: getDateProp(page, "Date"),
      readTime: getNumberProp(page, "ReadTime"),
      published: true,
      content: blocks,
    }
  } catch (err) {
    console.error("Notion getGuideBySlug error:", err)
    return null
  }
}

// ── Notion 블록 → 우리 형식으로 변환 ──
function parseBlock(block) {
  const type = block.type

  if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
    const text = richTextToString(block[type].rich_text)
    return text ? { type: "heading", text } : null
  }

  if (type === "paragraph") {
    const text = richTextToString(block.paragraph.rich_text)
    return text ? { type: "paragraph", text } : null
  }

  if (type === "bulleted_list_item") {
    const text = richTextToString(block.bulleted_list_item.rich_text)
    return text ? { type: "list_item", text } : null
  }

  if (type === "numbered_list_item") {
    const text = richTextToString(block.numbered_list_item.rich_text)
    return text ? { type: "list_item", text } : null
  }

  if (type === "callout") {
    const text = richTextToString(block.callout.rich_text)
    return text ? { type: "callout", text } : null
  }

  if (type === "quote") {
    const text = richTextToString(block.quote.rich_text)
    return text ? { type: "quote", text } : null
  }

  if (type === "divider") {
    return { type: "divider" }
  }

  return null
}

// ── 헬퍼 함수들 ──
function richTextToString(richText) {
  if (!richText || richText.length === 0) return ""
  return richText.map(t => t.plain_text).join("")
}

function getTitleProp(page) {
  const titleProp = Object.values(page.properties).find(p => p.type === "title")
  return titleProp ? richTextToString(titleProp.title) : ""
}

function getTextProp(page, name) {
  const prop = page.properties[name]
  if (!prop || prop.type !== "rich_text") return ""
  return richTextToString(prop.rich_text)
}

function getSelectProp(page, name) {
  const prop = page.properties[name]
  if (!prop || prop.type !== "select" || !prop.select) return ""
  return prop.select.name
}

function getDateProp(page, name) {
  const prop = page.properties[name]
  if (!prop || prop.type !== "date" || !prop.date) return ""
  return prop.date.start
}

function getNumberProp(page, name) {
  const prop = page.properties[name]
  if (!prop || prop.type !== "number") return 0
  return prop.number || 0
}
