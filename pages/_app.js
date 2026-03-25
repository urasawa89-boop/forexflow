import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>BayWorks - 수산물 수출입 관리</title>
        <meta name="description" content="수출입 실시간 환율 · HS코드 관세율 · 해양정보 · 수입원가 계산" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230088ff'/><text x='50' y='68' font-size='40' font-weight='800' text-anchor='middle' fill='white' font-family='Arial'>BW</text></svg>" />
        <meta name="theme-color" content="#08080f" />
      </Head>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #08080f; color: #e4e4ec; }
        ::selection { background: rgba(0,102,255,0.3); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
