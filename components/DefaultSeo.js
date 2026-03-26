import Head from "next/head"

// 기본 SEO 메타태그. 각 페이지에서 <DefaultSeo /> 또는 개별 <Head>로 오버라이드 가능.
export default function DefaultSeo({
  title = "Bay Works — 수산물 수입 실무 도구",
  description = "수산물 수출입 실무자를 위한 올인원 도구. 실시간 환율, HS코드 관세율 조회, 수입원가 계산기, 수입서류 체크리스트를 제공합니다.",
  url = "https://bayworksindex.com",
  image = "https://bayworksindex.com/logo.png",
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Bay Works" />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* 추가 SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#2B3539" />
      <meta name="author" content="Bay Works" />
    </Head>
  )
}
