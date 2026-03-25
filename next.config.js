const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Vercel CI 환경에서 eslint 규칙 차이로 빌드가 실패하지 않도록
    // 앱 번들/라우팅 검증은 `next build` 단계에서 계속 수행됩니다.
    ignoreDuringBuilds: true,
  },
}
module.exports = nextConfig
