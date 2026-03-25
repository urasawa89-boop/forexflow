import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Bay Works - West Coast Marine Supply</title>
        <meta name="description" content="수출입 실시간 환율 · HS코드 관세율 · 해양정보 · 수입원가 계산" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='18' fill='%23E8612D'/><text x='50' y='42' font-size='28' font-weight='900' text-anchor='middle' fill='white' font-family='Arial Black,Arial'>BAY</text><text x='50' y='72' font-size='22' font-weight='900' text-anchor='middle' fill='white' font-family='Arial Black,Arial'>WORKS</text></svg>" />
        <meta name="theme-color" content="#2F3B3F" />
      </Head>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #2B3539; color: #E8E4DF; }
        ::selection { background: rgba(232,97,45,0.35); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(232,97,45,0.3); border-radius: 3px; }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
