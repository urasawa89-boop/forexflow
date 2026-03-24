// pages/api/rates.js
// 서버에서 한국수출입은행 API를 호출해서 CORS 문제를 우회

export default async function handler(req, res) {
  // ★ 아래 API_KEY를 본인 키로 교체하세요
  // 발급: https://www.koreaexim.go.kr → 오픈API → 인증키 신청 (무료)
  const API_KEY = "9JiEUpxYu1XixUnXg8ku7Vi79i20btcF";

  try {
    // 오늘 날짜 (YYYYMMDD)
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0");

    const url = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${dateStr}&data=AP01`;

    const response = await fetch(url);
    const data = await response.json();

    // 필요한 통화만 추출
    const codeMap = {
      "USD": "USD",
      "JPY(100)": "JPY",
      "CNH": "CNY",
      "EUR": "EUR",
    };

    const rates = {};

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const mapped = codeMap[item.cur_unit];
        if (mapped) {
          const dealRate = parseFloat(item.deal_bas_r?.replace(/,/g, ""));
          if (!isNaN(dealRate)) {
            rates[mapped] = dealRate;
          }
        }
      });
    }

    // 데이터가 없으면 (주말/공휴일/오전11시 이전) 전날 시도
    if (Object.keys(rates).length === 0) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const ydStr = yesterday.getFullYear().toString() +
        (yesterday.getMonth() + 1).toString().padStart(2, "0") +
        yesterday.getDate().toString().padStart(2, "0");

      const url2 = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${ydStr}&data=AP01`;
      const res2 = await fetch(url2);
      const data2 = await res2.json();

      if (Array.isArray(data2)) {
        data2.forEach((item) => {
          const mapped = codeMap[item.cur_unit];
          if (mapped) {
            const dealRate = parseFloat(item.deal_bas_r?.replace(/,/g, ""));
            if (!isNaN(dealRate)) {
              rates[mapped] = dealRate;
            }
          }
        });
      }

      // 그래도 없으면 2일전
      if (Object.keys(rates).length === 0) {
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const tdStr = twoDaysAgo.getFullYear().toString() +
          (twoDaysAgo.getMonth() + 1).toString().padStart(2, "0") +
          twoDaysAgo.getDate().toString().padStart(2, "0");

        const url3 = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${tdStr}&data=AP01`;
        const res3 = await fetch(url3);
        const data3 = await res3.json();

        if (Array.isArray(data3)) {
          data3.forEach((item) => {
            const mapped = codeMap[item.cur_unit];
            if (mapped) {
              const dealRate = parseFloat(item.deal_bas_r?.replace(/,/g, ""));
              if (!isNaN(dealRate)) {
                rates[mapped] = dealRate;
              }
            }
          });
        }
      }
    }

    res.status(200).json({
      success: Object.keys(rates).length > 0,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      rates: {},
    });
  }
}
