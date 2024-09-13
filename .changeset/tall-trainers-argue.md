---
"@mcansh/http-helmet": patch
---

apply `upgrade-insecure-requests` when using kebab case to set it

previously was only applying the `upgrade-insecure-requests` directive when using camelCase (upgradeInsecureRequests)
