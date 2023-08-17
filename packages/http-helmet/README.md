# HTTP Helmet

easily add CSP and other security headers to your web application.

## Install

```sh
# npm
npm i @mcansh/http-helmet
```

## Usage

basic example using hono

```js
import crypto from "node:crypto";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createSecureHeaders } from "@mcansh/http-helmet";

const app = new Hono();

let html = String.raw;

app.get("/", () => {
  let nonce = crypto.randomBytes(16).toString("base64");

  let headers = createSecureHeaders({
    "Content-Security-Policy": {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`],
    },
  });

  headers.append("Content-Type", "text/html; charset=utf-8");

  return new Response(
    html`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Hello World</title>
        </head>
        <body>
          <h1>Hello World</h1>

          <script nonce="${nonce}">
            console.log("nonce configured");
          </script>

          <script>
            alert("nonce not configured");
          </script>
        </body>
      </html>
    `,
    { headers },
  );
});

serve(app, (info) => {
  console.log(`✅ app ready: http://${info.address}:${info.port}`);
});
```
