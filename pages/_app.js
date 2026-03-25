 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/pages/_app.js b/pages/_app.js
index 87852f4b199fe3b14c14bd84330270b6ed8f6d55..4553fdb4e7d62996d73fee1174b49449212e2f48 100644
--- a/pages/_app.js
+++ b/pages/_app.js
@@ -1,101 +1,94 @@
 import Head from 'next/head'
+import Link from 'next/link'
 import { useRouter } from 'next/router'
 
 const B = {
   orange: "#E8612D",
   orangeDim: "rgba(232,97,45,0.12)",
   bgCardBorder: "rgba(255,255,255,0.07)",
   textDim: "rgba(232,228,223,0.45)",
   headerBg: "#242D31",
 }
 
 function NavBar() {
   const router = useRouter()
   const path = router.pathname
-  const query = router.query
-
-  // Determine active sub-tab for index page
-  const indexTab = query.tab || "dashboard"
-
   const mainTabs = [
     { href: "/", label: "대시보드", match: "/" },
-    { href: "/?tab=products", label: "품목·관세", match: "products" },
-    { href: "/?tab=ocean", label: "해양정보", match: "ocean" },
-    { href: "/?tab=calculator", label: "계산기", match: "calculator" },
+    { href: "/products", label: "품목·관세", match: "/products" },
+    { href: "/ocean", label: "해양정보", match: "/ocean" },
+    { href: "/calculator", label: "계산기", match: "/calculator" },
     { href: "/docs", label: "수입서류", match: "/docs" },
     { href: "/tools", label: "수입도구", match: "/tools" },
   ]
 
   const isActive = (tab) => {
-    if (path === "/" && tab.match === "/" && indexTab === "dashboard") return true
-    if (path === "/" && tab.match === indexTab) return true
     if (tab.match === path) return true
     return false
   }
 
   const nb = (a) => ({
     padding: "7px 14px",
     borderRadius: 7,
     border: "none",
     background: a ? B.orangeDim : "transparent",
     color: a ? B.orange : B.textDim,
     fontWeight: a ? 600 : 400,
     fontSize: 12.5,
     cursor: "pointer",
     textDecoration: "none",
     display: "inline-block",
   })
 
   return (
     <header style={{
       background: B.headerBg,
       borderBottom: `1px solid ${B.bgCardBorder}`,
       padding: "10px 20px 0",
       display: "flex",
       flexDirection: "column",
       alignItems: "center",
       gap: 8,
     }}>
-      <a href="/"><img src="/logo.png" alt="Bay Works" style={{ height: 40, width: "auto" }} /></a>
+      <Link href="/"><img src="/logo.png" alt="Bay Works" style={{ height: 40, width: "auto" }} /></Link>
       <nav style={{
         display: "flex",
         gap: 2,
         flexWrap: "wrap",
         justifyContent: "center",
         borderTop: `1px solid ${B.bgCardBorder}`,
         width: "100%",
         paddingTop: 8,
         paddingBottom: 8,
       }}>
         {mainTabs.map(tab => (
-          <a key={tab.href} href={tab.href} style={nb(isActive(tab))}>{tab.label}</a>
+          <Link key={tab.href} href={tab.href} style={nb(isActive(tab))}>{tab.label}</Link>
         ))}
       </nav>
     </header>
   )
 }
 
 export default function App({ Component, pageProps }) {
   return (
     <>
       <Head>
         <title>Bay Works - West Coast Marine Supply</title>
         <meta name="description" content="수출입 실시간 환율 · HS코드 관세율 · 해양정보 · 수입원가 계산" />
         <meta name="viewport" content="width=device-width, initial-scale=1" />
         <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='18' fill='%23E8612D'/><text x='50' y='42' font-size='28' font-weight='900' text-anchor='middle' fill='white' font-family='Arial Black,Arial'>BAY</text><text x='50' y='72' font-size='22' font-weight='900' text-anchor='middle' fill='white' font-family='Arial Black,Arial'>WORKS</text></svg>" />
         <meta name="theme-color" content="#2B3539" />
-        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
       </Head>
       <style jsx global>{`
         * { margin: 0; padding: 0; box-sizing: border-box; }
         html, body { background: #2B3539; color: #E8E4DF; font-family: 'Pretendard', sans-serif; }
         ::selection { background: rgba(232,97,45,0.35); }
         ::-webkit-scrollbar { width: 6px; }
         ::-webkit-scrollbar-track { background: transparent; }
         ::-webkit-scrollbar-thumb { background: rgba(232,97,45,0.3); border-radius: 3px; }
       `}</style>
       <NavBar />
       <Component {...pageProps} />
     </>
   )
 }
 
EOF
)
