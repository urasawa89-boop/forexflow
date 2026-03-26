// pages/api/news.js
// 수산물 뉴스 자동수집 API
// 소스1: 네이버 뉴스 검색 API (수산물 수출입 관련 키워드)
// 소스2: 해양수산부 보도자료 (korea.kr 정책브리핑 RSS)

const NAVER_CLIENT_ID = "blP_yA_HdI7GIBZAd2Rc"
const NAVER_CLIENT_SECRET = "jBw9uNuVkg"

// 수산물 수출입에 집중된 검색 키워드 (넓은 키워드 제거)
const SEARCH_QUERIES = [
  "수산물 수입 관세",
  "수산물 수출 실적",
  "수산물 검역 통관",
  "냉동수산물 수입",
  "수산물 FTA 관세",
]

// 카테고리 자동 분류 키워드
const CATEGORY_RULES = [
  { keywords: ["관세", "FTA", "RCEP", "양허", "세율", "할당관세", "TRQ"], category: "관세" },
  { keywords: ["검역", "방사능", "잔류", "수입금지", "안전성", "부적합", "식품검사"], category: "검역" },
  { keywords: ["수출", "K-씨푸드", "수출액", "수출량", "수출 목표"], category: "수출" },
  { keywords: ["수입량", "수입액", "통계", "증가", "감소", "전년대비", "전년 대비"], category: "통계" },
  { keywords: ["정책", "계획", "목표", "추진", "시행", "개정", "법안"], category: "정책" },
  { keywords: ["양식", "어황", "조업", "수온", "태풍", "어획"], category: "어황" },
  { keywords: ["지원", "공모", "사업", "보조", "융자", "지원금"], category: "지원사업" },
  { keywords: ["원산지", "표시", "위반", "단속", "규제", "제재"], category: "규제" },
]

// ── 관련없는 뉴스 제외 키워드 ──
const EXCLUDE_KEYWORDS = [
  "낚시", "레저", "축제", "맛집", "관광", "여행", "체험",
  "해수욕", "서핑", "요트", "크루즈", "해양쓰레기", "해양오염",
  "해양경찰", "해경", "실종", "사고", "구조", "전복사고",
  "부동산", "아파트", "분양", "재건축",
  "스포츠", "야구", "축구", "프로야구",
  "날씨", "기상", "기상청",
  "선거", "국회", "정치",
  "연예", "드라마", "영화",
]

// ── 수산물 수출입 관련 필수 키워드 (하나 이상 포함해야 통과) ──
const INCLUDE_KEYWORDS = [
  "수산물", "수산", "어류", "새우", "연어", "참치", "고등어", "오징어",
  "냉동", "활어", "신선", "수입", "수출", "관세", "통관", "검역",
  "HS코드", "FTA", "RCEP", "할당관세", "TRQ",
  "양식", "어업", "어획", "수산식품", "해산물",
  "김", "미역", "다시마", "전복", "굴", "게", "랍스터",
  "식약처", "식품검사", "원산지", "수입금지", "부적합",
  "해양수산부", "수산무역", "수산물품질",
]

function classifyCategory(title) {
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => title.includes(kw))) return rule.category
  }
  return "일반"
}

function isImportant(title) {
  const importantKeywords = ["수입금지", "긴급", "관세인하", "FTA", "방사능", "수출 목표", "역대", "위반", "부적합"]
  return importantKeywords.some(kw => title.includes(kw))
}

// 관련성 필터: 관련없는 뉴스 제거 + 관련 키워드 필수
function isRelevant(title, description) {
  const text = (title + " " + (description || "")).toLowerCase()

  // 제외 키워드가 포함되면 제거
  if (EXCLUDE_KEYWORDS.some(kw => text.includes(kw))) return false

  // 필수 키워드 중 하나 이상 포함해야 통과
  if (!INCLUDE_KEYWORDS.some(kw => text.includes(kw))) return false

  return true
}

// HTML 태그 및 하이라이트 제거
function cleanHtml(str) {
  return (str || "").replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'")
}

// ── 네이버 뉴스 검색 API ──
async function fetchNaverNews() {
  if (NAVER_CLIENT_ID === "YOUR_NAVER_CLIENT_ID") return []

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

          // 중복 제거
          if (allItems.find(x => x.title === title)) return

          // 관련성 필터링
          if (!isRelevant(title, desc)) return

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
    const rssUrl = "https://www.korea.kr/rss/policy.xml"
    const res = await fetch(rssUrl, { headers: { "User-Agent": "BayWorks/1.0" } })
    if (!res.ok) return []
    const text = await res.text()

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

      // 수산물/해양 관련 기사만 필터링 (더 엄격하게)
      const fishKeywords = ["수산", "어업", "양식", "수출입", "관세", "검역", "FTA", "RCEP", "어촌", "어획", "수산식품"]
      if (!fishKeywords.some(kw => title.includes(kw))) continue

      // 제외 키워드 체크
      if (EXCLUDE_KEYWORDS.some(kw => title.includes(kw))) continue

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
    const [naverNews, mofNews] = await Promise.all([
      fetchNaverNews(),
      fetchMofNews(),
    ])

    const allNews = [...mofNews, ...naverNews]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50)

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
