// pages/api/rates.js
// 환율 API — 수출입은행 우선, 실패 시 무료 API 폴백
//
// 1순위: 한국수출입은행 (TTS/TTB 상세 제공, 한국IP에서만 동작)
// 2순위: ExchangeRate-API (해외 서버에서도 동작, 무료 1,500건/월)
// 3순위: Open Exchange Rates 폴백

export const config = { regions: ["icn1"] } // Vercel 한국 리전 시도

const KOREAEXIM_KEY = "9JiEUpxYu1XixUnXg8ku7Vi79i20btcF"

// ── 1순위: 한국수출입은행 API ──
async function fetchKoreaExim() {
  const now = new Date()
  // 최대 4일 전까지 시도 (주말/공휴일 대비)
  for (let i = 0; i <= 4; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.getFullYear().toString() +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      d.getDate().toString().padStart(2, "0")

    try {
      const url = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${KOREAEXIM_KEY}&searchdate=${dateStr}&data=AP01`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) continue

      const codeMap = { "USD": "USD", "JPY(100)": "JPY", "CNH": "CNY", "EUR": "EUR" }
      const rates = {}
      const detailed = {}

      data.forEach((item) => {
        const mapped = codeMap[item.cur_unit]
        if (!mapped) return
        const parse = (v) => v ? parseFloat(v.replace(/,/g, "")) : null
        rates[mapped] = parse(item.deal_bas_r)
        detailed[mapped] = {
          base: parse(item.deal_bas_r),
          tts: parse(item.tts),
          ttb: parse(item.ttb),
          cashSell: parse(item.kftc_deal_bas_r) ? parse(item.kftc_deal_bas_r) * 1.018 : null,
          cashBuy: parse(item.kftc_deal_bas_r) ? parse(item.kftc_deal_bas_r) * 0.982 : null,
          usdConversion: parse(item.bkpr),
          name: item.cur_nm,
          tenDayRate: parse(item.ten_dd_efee_r),
        }
      })

      if (Object.keys(rates).length > 0) {
        return { success: true, rates, detailed, source: "koreaexim" }
      }
    } catch (e) {
      // 타임아웃 또는 네트워크 에러 → 다음 시도
    }
  }
  return null
}

// ── 2순위: 무료 환율 API (해외 서버에서도 동작) ──
async function fetchFreeApi() {
  try {
    // open.er-api.com — 완전 무료, API키 불필요
    const res = await fetch("https://open.er-api.com/v6/latest/KRW", {
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error("er-api failed")
    const data = await res.json()

    if (data.result === "success" && data.rates) {
      // KRW 기준 → 1외화당 원화로 변환
      const usd = data.rates.USD ? (1 / data.rates.USD) : null
      const jpy = data.rates.JPY ? (100 / data.rates.JPY) : null // 100엔 기준
      const cny = data.rates.CNY ? (1 / data.rates.CNY) : null
      const eur = data.rates.EUR ? (1 / data.rates.EUR) : null

      const rates = {}
      const detailed = {}

      if (usd) {
        rates.USD = Math.round(usd * 100) / 100
        detailed.USD = { base: rates.USD, tts: Math.round(usd * 1.0075 * 100) / 100, ttb: Math.round(usd * 0.9925 * 100) / 100, name: "미국 달러" }
      }
      if (jpy) {
        rates.JPY = Math.round(jpy * 100) / 100
        detailed.JPY = { base: rates.JPY, tts: Math.round(jpy * 1.0075 * 100) / 100, ttb: Math.round(jpy * 0.9925 * 100) / 100, name: "일본 엔" }
      }
      if (cny) {
        rates.CNY = Math.round(cny * 100) / 100
        detailed.CNY = { base: rates.CNY, tts: Math.round(cny * 1.0075 * 100) / 100, ttb: Math.round(cny * 0.9925 * 100) / 100, name: "중국 위안" }
      }
      if (eur) {
        rates.EUR = Math.round(eur * 100) / 100
        detailed.EUR = { base: rates.EUR, tts: Math.round(eur * 1.0075 * 100) / 100, ttb: Math.round(eur * 0.9925 * 100) / 100, name: "유로" }
      }

      return { success: true, rates, detailed, source: "open-er-api" }
    }
  } catch (e) {
    // 폴백 실패
  }

  // 3순위: exchangerate.host
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=KRW,JPY,CNY,EUR", {
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error("exchangerate.host failed")
    const data = await res.json()
    if (data.success && data.rates && data.rates.KRW) {
      const krwPerUsd = data.rates.KRW
      const rates = {
        USD: Math.round(krwPerUsd * 100) / 100,
        JPY: data.rates.JPY ? Math.round((krwPerUsd / data.rates.JPY) * 100 * 100) / 100 : null,
        CNY: data.rates.CNY ? Math.round((krwPerUsd / data.rates.CNY) * 100) / 100 : null,
        EUR: data.rates.EUR ? Math.round((krwPerUsd / data.rates.EUR) * 100) / 100 : null,
      }
      const detailed = {}
      Object.keys(rates).forEach(k => {
        if (rates[k]) detailed[k] = { base: rates[k], tts: null, ttb: null }
      })
      return { success: true, rates, detailed, source: "exchangerate-host" }
    }
  } catch (e) {
    // 모든 API 실패
  }

  return null
}

export default async function handler(req, res) {
  try {
    // 1순위: 수출입은행
    let result = await fetchKoreaExim()

    // 2순위: 무료 API
    if (!result) {
      result = await fetchFreeApi()
    }

    if (result) {
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString(),
      })
    } else {
      res.status(200).json({
        success: false,
        rates: {},
        detailed: {},
        source: "none",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      rates: {},
      detailed: {},
    })
  }
}
