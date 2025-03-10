---
"@mcansh/http-helmet": patch
---

allows shorthand for Strict-Transport-Policy header using `createStrictTransportSecurity` function and `createSecureHeaders` functions

```js
import { createStrictTransportSecurity } from "@mcansh/http-helmet";

let hsts = createStrictTransportSecurity({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
});
// => "max-age=31536000; includeSubDomains; preload"
```

