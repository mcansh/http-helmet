---
"@mcansh/http-helmet": patch
"@mcansh/remix-secure-headers": patch
---

chore: add support for more headers, add check to ensure we set them

may or may not have not actually been setting COEP, COOP, CORP, X-Content-Type-Options, X-DNS-Prefetch-Control headers 😬
