---
"@mcansh/http-helmet": patch
---

allow setting Content-Security-Policy-Report-Only

```js
let secureHeaders = createSecureHeaders({
  "Content-Security-Policy-Report-Only": {
    "default-src": ["'self'"],
    "img-src": ["'self'", "data:"],
  },
});
```
