import { jsx, jsxs } from "react/jsx-runtime";
import Crypto from "node:crypto";
import * as React from "react";
import { createElement } from "react";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, useParams, useLoaderData, useActionData, useMatches, useRouteError, Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse } from "react-router";
const SPLIT_LOWER_UPPER_RE = new RegExp("([\\p{Ll}\\d])(\\p{Lu})", "gu");
const SPLIT_UPPER_UPPER_RE = new RegExp("(\\p{Lu})([\\p{Lu}][\\p{Ll}])", "gu");
const SPLIT_SEPARATE_NUMBER_RE = new RegExp("(\\d)\\p{Ll}|(\\p{L})\\d", "u");
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
const SPLIT_REPLACE_VALUE = "$1\0$2";
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
function split(value) {
  let result = value.trim();
  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");
  let start = 0;
  let end = result.length;
  while (result.charAt(start) === "\0")
    start++;
  if (start === end)
    return [];
  while (result.charAt(end - 1) === "\0")
    end--;
  return result.slice(start, end).split(/\0/g);
}
function splitSeparateNumbers(value) {
  const words = split(value);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match) {
      const offset = match.index + (match[1] ?? match[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}
function noCase(input, options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  return prefix + words.map(lowerFactory(options == null ? void 0 : options.locale)).join((options == null ? void 0 : options.delimiter) ?? " ") + suffix;
}
function kebabCase(input, options) {
  return noCase(input, { delimiter: "-", ...options });
}
function lowerFactory(locale) {
  return locale === false ? (input) => input.toLowerCase() : (input) => input.toLocaleLowerCase(locale);
}
function splitPrefixSuffix(input, options = {}) {
  const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;
  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char))
      break;
    prefixIndex++;
  }
  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char))
      break;
    suffixIndex = index;
  }
  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex)
  ];
}
function isQuoted(value) {
  return /^".*"$/.test(value);
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function mergeHeaders(...sources) {
  let result = new Headers();
  for (let source of sources) {
    if (!isObject(source)) {
      throw new TypeError("All arguments must be of type object");
    }
    let headers = new Headers(source);
    for (let [key, value] of headers.entries()) {
      if (value === void 0 || value === "undefined") {
        result.delete(key);
      } else if (key === "set-cookie") {
        result.append(key, value);
      } else {
        result.set(key, value);
      }
    }
  }
  return new Headers(result);
}
function createNonce() {
  return Crypto.randomBytes(16).toString("hex");
}
var reservedCSPKeywords = /* @__PURE__ */ new Set([
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval"
]);
function createContentSecurityPolicy(settings) {
  let { "upgrade-insecure-requests": upgradeInsecureRequests, ...rest } = Object.entries(settings).reduce(
    (acc, [key, value]) => {
      let kebab = kebabCase(key);
      if (acc[kebab]) {
        throw new Error(
          `[createContentSecurityPolicy]: The key "${key}" was specified in camelCase and kebab-case.`
        );
      }
      acc[kebab] = value;
      return acc;
    },
    {}
  );
  let policy = [];
  if (upgradeInsecureRequests) {
    policy.push("upgrade-insecure-requests");
  }
  for (let [key, values] of Object.entries(rest)) {
    let allowedValuesSeen = /* @__PURE__ */ new Set();
    if (!Array.isArray(values)) {
      throw new Error(
        `[createContentSecurityPolicy]: The value of the "${key}" must be array of strings.`
      );
    }
    let definedValues = values.filter(
      (v) => typeof v !== "undefined"
    );
    definedValues.forEach((allowedValue) => {
      if (typeof allowedValue !== "string") {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${key}" contains a non-string, which is not supported.`
        );
      }
      if (allowedValuesSeen.has(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${key}" contains duplicates, which it shouldn't.`
        );
      }
      if (reservedCSPKeywords.has(allowedValue) && !isQuoted(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: reserved keyword ${allowedValue} must be quoted.`
        );
      }
      allowedValuesSeen.add(allowedValue);
    });
    if (definedValues.length === 0) {
      throw new Error(
        `[createContentSecurityPolicy]: key "${key}" has no defined options`
      );
    }
    policy.push(`${key} ${definedValues.join(" ")}`);
  }
  return policy.join("; ");
}
var reservedPermissionKeywords = /* @__PURE__ */ new Set(["self", "*"]);
function createPermissionsPolicy(features) {
  return Object.entries(features).map(([key, featureValues]) => {
    if (!Array.isArray(featureValues)) {
      throw new Error(
        `The value of the "${key}" feature must be array of strings.`
      );
    }
    const allowedValuesSeen = /* @__PURE__ */ new Set();
    featureValues.forEach((allowedValue) => {
      if (typeof allowedValue !== "string") {
        throw new Error(
          `[createPermissionsPolicy]: The value of "${key}" contains a non-string, which is not supported.`
        );
      }
      if (allowedValuesSeen.has(allowedValue)) {
        throw new Error(
          `[createPermissionsPolicy]: The value of "${key}" contains duplicates, which it shouldn't.`
        );
      }
      if (allowedValue === "'self'") {
        throw new Error(
          `[createPermissionsPolicy]: self must not be quoted for "${key}".`
        );
      }
      allowedValuesSeen.add(allowedValue);
    });
    if (featureValues.length > 1 && allowedValuesSeen.has("*")) {
      throw new Error(
        `[createPermissionsPolicy]: The value of the "${key}" feature cannot contain * and other values.`
      );
    }
    const featureKeyDashed = kebabCase(key);
    const featureValuesUnion = featureValues.map((value) => {
      if (reservedPermissionKeywords.has(value)) {
        return value;
      }
      return `"${value}"`;
    }).join(" ");
    if (featureValuesUnion === "*") {
      return `${featureKeyDashed}=${featureValuesUnion}`;
    }
    return `${featureKeyDashed}=(${featureValuesUnion})`;
  }).join(", ");
}
function createStrictTransportSecurity(options) {
  let header = `max-age=${options.maxAge}`;
  if (options.includeSubDomains) {
    header += "; includeSubDomains";
  }
  if (options.preload) {
    header += "; preload";
  }
  return header;
}
function createSecureHeaders(options) {
  let headers = new Headers();
  if (options["Content-Security-Policy"] && options["Content-Security-Policy-Report-Only"]) {
    throw new Error(
      "createSecureHeaders: Content-Security-Policy and Content-Security-Policy-Report-Only cannot be set at the same time"
    );
  }
  if (options["Content-Security-Policy"]) {
    headers.set(
      "Content-Security-Policy",
      createContentSecurityPolicy(options["Content-Security-Policy"])
    );
  }
  if (options["Content-Security-Policy-Report-Only"]) {
    headers.set(
      "Content-Security-Policy-Report-Only",
      createContentSecurityPolicy(
        options["Content-Security-Policy-Report-Only"]
      )
    );
  }
  if (options["X-Frame-Options"]) {
    headers.set("X-Frame-Options", options["X-Frame-Options"]);
  }
  if (options["Permissions-Policy"]) {
    headers.set(
      "Permissions-Policy",
      createPermissionsPolicy(options["Permissions-Policy"])
    );
  }
  if (options["Strict-Transport-Security"]) {
    headers.set(
      "Strict-Transport-Security",
      createStrictTransportSecurity(options["Strict-Transport-Security"])
    );
  }
  if (options["Referrer-Policy"]) {
    headers.set("Referrer-Policy", options["Referrer-Policy"]);
  }
  if (options["X-XSS-Protection"]) {
    headers.set("X-XSS-Protection", options["X-XSS-Protection"]);
  }
  if (options["Cross-Origin-Embedder-Policy"]) {
    headers.set(
      "Cross-Origin-Embedder-Policy",
      options["Cross-Origin-Embedder-Policy"]
    );
  }
  if (options["Cross-Origin-Opener-Policy"]) {
    headers.set(
      "Cross-Origin-Opener-Policy",
      options["Cross-Origin-Opener-Policy"]
    );
  }
  if (options["Cross-Origin-Resource-Policy"]) {
    headers.set(
      "Cross-Origin-Resource-Policy",
      options["Cross-Origin-Resource-Policy"]
    );
  }
  if (options["X-Content-Type-Options"]) {
    headers.set("X-Content-Type-Options", options["X-Content-Type-Options"]);
  }
  if (options["X-DNS-Prefetch-Control"]) {
    headers.set("X-DNS-Prefetch-Control", options["X-DNS-Prefetch-Control"]);
  }
  for (const key of Object.keys(options)) {
    if (!headers.has(key)) {
      throw new Error(`createSecureHeaders: ${key} was not set`);
    }
  }
  return headers;
}
var NonceContext = React.createContext(void 0);
function NonceProvider({ nonce, children }) {
  return /* @__PURE__ */ React.createElement(NonceContext.Provider, { value: nonce }, children);
}
function useNonce() {
  return React.useContext(NonceContext);
}
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, _loadContext) {
  const nonce = createNonce();
  const secureHeaders = createSecureHeaders({
    "Content-Security-Policy": {
      "script-src": ["'self'", `'nonce-${nonce}'`]
    }
  });
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(NonceProvider, { nonce, children: /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: request.url,
          abortDelay: ABORT_DELAY,
          nonce
        }
      ) }),
      {
        nonce,
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: mergeHeaders(responseHeaders, secureHeaders),
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const stylesheet = "/assets/app-Ckulty-W.css";
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}, {
  rel: "stylesheet",
  href: stylesheet
}];
function Layout({
  children
}) {
  const nonce = useNonce();
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {
        nonce
      }), /* @__PURE__ */ jsx(Scripts, {
        nonce
      })]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const logoDark = "/assets/logo-dark-pX2395Y0.svg";
const logoLight = "/assets/logo-light-CVbx2LBR.svg";
function Welcome() {
  return /* @__PURE__ */ jsx("main", { className: "flex items-center justify-center pt-16 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-16 min-h-0", children: [
    /* @__PURE__ */ jsx("header", { className: "flex flex-col items-center gap-9", children: /* @__PURE__ */ jsxs("div", { className: "w-[500px] max-w-[100vw] p-4", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: logoLight,
          alt: "React Router",
          className: "block w-full dark:hidden"
        }
      ),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: logoDark,
          alt: "React Router",
          className: "hidden w-full dark:block"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-[300px] w-full space-y-6 px-4", children: /* @__PURE__ */ jsxs("nav", { className: "rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "leading-6 text-gray-700 dark:text-gray-200 text-center", children: "What's next?" }),
      /* @__PURE__ */ jsx("ul", { children: resources.map(({ href, text, icon }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "a",
        {
          className: "group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500",
          href,
          target: "_blank",
          rel: "noreferrer",
          children: [
            icon,
            text
          ]
        }
      ) }, href)) })
    ] }) })
  ] }) });
}
const resources = [
  {
    href: "https://reactrouter.com/docs",
    text: "React Router Docs",
    icon: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        className: "stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300",
        children: /* @__PURE__ */ jsx(
          "path",
          {
            d: "M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z",
            strokeWidth: "1.5",
            strokeLinecap: "round"
          }
        )
      }
    )
  },
  {
    href: "https://rmx.as/discord",
    text: "Join Discord",
    icon: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "20",
        viewBox: "0 0 24 20",
        fill: "none",
        className: "stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300",
        children: /* @__PURE__ */ jsx(
          "path",
          {
            d: "M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z",
            strokeWidth: "1.5"
          }
        )
      }
    )
  }
];
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(Welcome, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CI1sUmQy.js", "imports": ["/assets/chunk-7R3XDUXW-DIs3TCXd.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-8wWg43A6.js", "imports": ["/assets/chunk-7R3XDUXW-DIs3TCXd.js", "/assets/with-props-CiSnTo55.js"], "css": [] }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/home-Cxb8TbmW.js", "imports": ["/assets/with-props-CiSnTo55.js", "/assets/chunk-7R3XDUXW-DIs3TCXd.js"], "css": [] } }, "url": "/assets/manifest-dbd067b2.js", "version": "dbd067b2" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  publicPath,
  routes
};
