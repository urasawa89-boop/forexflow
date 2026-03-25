// pages/api/news.js
// 수산물 뉴스 자동수집 API
// 소스1: 네이버 뉴스 검색 API (수산물 수출입 관련 키워드)
// 소스2: 해양수산부 보도자료 (korea.kr 정책브리핑 RSS)
//
// ★ 네이버 API 키 발급: https://developers.naver.com → Application 등록 → 검색 API 선택
//    - Client ID / Client Secret 발급 후 아래에 입력

const NAVER_CLIENT_ID = "blP_yA_HdI7GIBZAd2Rc"       // ← 여기에 입력
const NAVER_CLIENT_SECRET = "jBw9uNuVkg" // ← 여기에 입력

// 수산물 관련 검색 키워드 (네이버 뉴스용)
const SEARCH_QUERIES = [
  "수산물 수입",
  "수산물 수출",
  "수산물 관세",
  "해양수산부",
  "수산물 검역",
]

// 카테고리 자동 분류 키워드
const CATEGORY_RULES = [
  { keywords: ["관세", "FTA", "RCEP", "양허", "세율"], category: "관세" },
  { keywords: ["검역", "방사능", "잔류", "수입금지", "안전성"], category: "검역" },
  { keywords: ["수출", "K-씨푸드", "수출액", "수출량"], category: "수출" },
  { keywords: ["수입량", "수입액", "통계", "증가", "감소", "전년대비"], category: "통계" },
  { keywords: ["정책", "계획", "목표", "추진", "시행", "개정"], category: "정책" },
  { keywords: ["양식", "어황", "조업", "해양", "수온", "태풍"], category: "어황" },
  { keywords: ["지원", "공모", "사업", "보조", "융자"], category: "지원사업" },
  { keywords: ["원산지", "표시", "위반", "단속", "규제"], category: "규제" },
]

function classifyCategory(title) {
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => title.includes(kw))) return rule.category
  }
  return "일반"
}

function isImportant(title) {
  const importantKeywords = ["수입금지", "긴급", "관세인하", "FTA", "방사능", "수출 목표", "역대", "위반"]
  return importantKeywords.some(kw => title.includes(kw))
}

// HTML 태그 및 하이라이트 제거
function cleanHtml(str) {
  return (str || "").replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'")
}

// ── 네이버 뉴스 검색 API ──
async function fetchNaverNews() {
  if (NAVER_CLIENT_ID === "YOUR_NAVER_CLIENT_ID") return [] // 키 미설정 시 스킵

  const allItems = []
  for (const query of SEARCH_QUERIES) {
    try {
      const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`
      const res = await fetch(url, {
        headers: {
          "X-Naver-Client-Id": NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
        },
      })
      if (!res.ok) continue
      const data = await res.json()
      if (data.items) {
        data.items.forEach(item => {
          const title = cleanHtml(item.title)
          const desc = cleanHtml(item.description)
          // 중복 제거용 (같은 제목 skip)
          if (!allItems.find(x => x.title === title)) {
            allItems.push({
              title,
              description: desc,
              link: item.originallink || item.link,
              date: new Date(item.pubDate).toISOString().split("T")[0],
              source: "naver",
              sourceName: "네이버뉴스",
              category: classifyCategory(title),
              important: isImportant(title),
              query,
            })
          }
        })
      }
    } catch (e) {
      console.error(`Naver search error (${query}):`, e.message)
    }
  }
  return allItems
}

// ── 해양수산부 보도자료 (정책브리핑 RSS) ──
async function fetchMofNews() {
  try {
    // 정책브리핑 해양수산부 보도자료 RSS
    const rssUrl = "https://www.korea.kr/rss/policy.xml"
    const res = await fetch(rssUrl, { headers: { "User-Agent": "BayWorks/1.0" } })
    if (!res.ok) return []
    const text = await res.text()

    // 간단한 XML 파싱 (의존성 없이)
    const items = []
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g)
    if (!itemMatches) return []

    for (const itemXml of itemMatches.slice(0, 30)) {
      const getTag = (tag) => {
        const m = itemXml.match(new RegExp(`<${tag}>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?<\\/${tag}>`))
        return m ? (m[2] || "").trim() : ""
      }
      const title = getTag("title").replace(/<!\[CDATA\[|\]\]>/g, "")
      const link = getTag("link")
      const pubDate = getTag("pubDate")

      // 수산물/해양 관련 기사만 필터링
      const fishKeywords = ["수산", "해양", "어업", "양식", "수출입", "관세", "검역", "FTA", "RCEP", "물류", "항만", "선박", "어촌"]
      if (!fishKeywords.some(kw => title.includes(kw))) continue

      items.push({
        title: cleanHtml(title),
        description: "",
        link,
        date: pubDate ? new Date(pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        source: "mof",
        sourceName: "해양수산부",
        category: classifyCategory(title),
        important: isImportant(title),
      })
    }
    return items
  } catch (e) {
    console.error("MOF RSS error:", e.message)
    return []
  }
}

export default async function handler(req, res) {
  try {
    // 두 소스에서 동시 수집
    const [naverNews, mofNews] = await Promise.all([
      fetchNaverNews(),
      fetchMofNews(),
    ])

    // 합치고 날짜순 정렬
    const allNews = [...mofNews, ...naverNews]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50) // 최대 50건

    // ID 부여
    allNews.forEach((item, i) => { item.id = i + 1 })

    res.status(200).json({
      success: true,
      count: allNews.length,
      news: allNews,
      sources: {
        naver: naverNews.length,
        mof: mofNews.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      news: [],
    })
  }
}
