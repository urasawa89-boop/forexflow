export const config = { regions: ["icn1"] }  // 한국 리전에서 실행
// pages/api/rates.js
// 한국수출입은행 환율 API - 상세 환율 (매매기준율 + 전신환매도/매입 + 현찰)
//
// ★ API 키 발급: https://www.koreaexim.go.kr → 오픈API → 인증키 신청 (무료)

const API_KEY = "9JiEUpxYu1XixUnXg8ku7Vi79i20btcF";

export default async function handler(req, res) {
  try {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0");

    const url = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${dateStr}&data=AP01`;

    let data = null;
    const response = await fetch(url);
    if (response.ok) data = await response.json();

    // 당일 데이터 없으면 전날/2일전 시도
    if (!data || !Array.isArray(data) || data.length === 0) {
      for (let i = 1; i <= 3; i++) {
        const prev = new Date(now);
        prev.setDate(prev.getDate() - i);
        const prevStr = prev.getFullYear().toString() +
          (prev.getMonth() + 1).toString().padStart(2, "0") +
          prev.getDate().toString().padStart(2, "0");
        const url2 = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${prevStr}&data=AP01`;
        const res2 = await fetch(url2);
        if (res2.ok) {
          const d2 = await res2.json();
          if (Array.isArray(d2) && d2.length > 0) { data = d2; break; }
        }
      }
    }

    const codeMap = { "USD": "USD", "JPY(100)": "JPY", "CNH": "CNY", "EUR": "EUR" };
    const rates = {};

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const mapped = codeMap[item.cur_unit];
        if (mapped) {
          const parse = (v) => v ? parseFloat(v.replace(/,/g, "")) : null;
          rates[mapped] = {
            // 매매기준율 (기본 환율)
            base: parse(item.deal_bas_r),
            // 전신환매도율 (TTS) — 은행이 외화를 파는 가격
            // → 수입업체가 수입대금 송금할 때 적용
            tts: parse(item.tts),
            // 전신환매입율 (TTB) — 은행이 외화를 사는 가격  
            // → 수출업체가 수출대금 받을 때 적용
            ttb: parse(item.ttb),
            // 현찰매도율 — 현금으로 외화 살 때
            cashSell: parse(item.kftc_deal_bas_r) ? parse(item.kftc_deal_bas_r) * 1.018 : null,
            // 현찰매입율 — 현금으로 외화 팔 때
            cashBuy: parse(item.kftc_deal_bas_r) ? parse(item.kftc_deal_bas_r) * 0.982 : null,
            // 미화 환산율
            usdConversion: parse(item.bkpr),
            // 통화명
            name: item.cur_nm,
            // 10일 환가료율
            tenDayRate: parse(item.ten_dd_efee_r),
          };
        }
      });
    }

    const hasData = Object.keys(rates).length > 0;

    // 단순 rates (기존 호환) + 상세 detailedRates
    const simpleRates = {};
    Object.keys(rates).forEach(k => { simpleRates[k] = rates[k].base; });

    res.status(200).json({
      success: hasData,
      rates: simpleRates,
      detailed: rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      rates: {},
      detailed: {},
    });
  }
}
