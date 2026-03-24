import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>ForexFlow - 외화 입출금 관리</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #08080f; color: #e4e4ec; }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
