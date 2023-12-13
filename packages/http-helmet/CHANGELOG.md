# @mcansh/http-helmet

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
