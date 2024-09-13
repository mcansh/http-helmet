---
"@mcansh/http-helmet": patch
"example-app": patch
"example-vite-app": patch
---

feat: filter out falsy values from csp

createContentSecurityPolicy({
    "connect-src": [undefined, "'self'", undefined],
});

// => `"connect-src 'self'"`
