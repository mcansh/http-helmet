---
"@mcansh/http-helmet": patch
---

allow using kebab case keys for csp

```js
let secureHeaders = createSecureHeaders({
  "Content-Security-Policy": {
    "default-src": ["'self'"],
    "img-src": ["'self'", "data:"],
  },
});
```
