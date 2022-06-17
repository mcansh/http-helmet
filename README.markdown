# Remix Secure Headers

## Install

```sh
# npm
npm i @mcansh/remix-secure-headers
# pnpm
pnpm i @mcansh/remix-secure-headers
# yarn
yarn add @mcansh/remix-secure-headers
```

## Usage

```diff
// app/entry.server.tsx
+ import { createSecureHeaders } from "@mcansh/remix-secure-headers";

+ let headers = createSecureHeaders({
+   "Strict-Transport-Security": {
+     maxAge: 3600,
+     includeSubDomains: true,
+     preload: true,
+   },
+   "Content-Security-Policy": {
+     defaultSrc: ["'self'"],
+   },
+   "Permissions-Policy": {
+     battery: ["none"],
+   },
+ });

async function handleDocumentRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer url={request.url} context={remixContext} />
  );

  responseHeaders.set("Content-Type", "text/html");
+  for (const header of securityHeaders) {
+    responseHeaders.set(...header);
+  }

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
```
