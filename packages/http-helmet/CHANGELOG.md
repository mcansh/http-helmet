# @mcansh/http-helmet

## 0.11.2

### Patch Changes

- 4597846: dont allow mixing kebab-case and camelCase csp keys and make it so csp isnt required

## 0.11.1

### Patch Changes

- f0a2ee3: feat: only allow using kebab or camel case, not both

## 0.11.0

### Minor Changes

- 9b7cc24: feat: filter out falsy values from csp

  ```js
  createContentSecurityPolicy({
    "connect-src": [undefined, "'self'", undefined],
  });

  // => `"connect-src 'self'"`
  ```

### Patch Changes

- 9b7cc24: apply `upgrade-insecure-requests` when using kebab case to set it

  previously was only applying the `upgrade-insecure-requests` directive when using camelCase (upgradeInsecureRequests)

## 0.10.3

### Patch Changes

- c4b0b6a: allow using kebab case keys for csp

  ```js
  let secureHeaders = createSecureHeaders({
    "Content-Security-Policy": {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"],
    },
  });
  ```

- 1cee380: allow setting Content-Security-Policy-Report-Only

  ```js
  let secureHeaders = createSecureHeaders({
    "Content-Security-Policy-Report-Only": {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"],
    },
  });
  ```

## 0.10.2

### Patch Changes

- 8e1c380: bump dependencies to latest versions
- 6919888: add nonce generation, context provider, and hook for React and Remix apps

## 0.10.1

### Patch Changes

- ba87f33: add funding to package.json

## 0.10.0

### Minor Changes

- 7b0c887: re-export types/functions remove deprecated `strictTransportSecurity` in favor of renamed `createStrictTransportSecurity`
- 7d1d570: use Headers global instead of the implementation from `@remix-run/web-fetch`

### Patch Changes

- d439533: add mergeHeaders utility to merge your exisiting headers with the ones created by createdSecureHeaders
- 12329f8: bump dependencies to latest versions

## 0.9.0

### Minor Changes

- 0d92a95: stop publishing `@mcansh/remix-secure-headers`

## 0.8.2

### Patch Changes

- b9372b6: chore: add support for more headers, add check to ensure we set them

  may or may not have not actually been setting COEP, COOP, CORP, X-Content-Type-Options, X-DNS-Prefetch-Control headers 😬

## 0.8.1

### Patch Changes

- 7d28c52: rename repo, publish with provenance

  rename github repo, add repository property to package's package.json

  publish with npm provenance

  update example in README

## 0.8.0

### Minor Changes

- 095ff81: rename package as it's for more than just remix

### Patch Changes

- aea04b9: chore(deps): bump to latest
