---
"@mcansh/http-helmet": minor
---

feat: filter out falsy values from csp

```js
createContentSecurityPolicy({
    "connect-src": [undefined, "'self'", undefined],
});

// => `"connect-src 'self'"`
```
