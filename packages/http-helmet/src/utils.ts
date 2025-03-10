export function isQuoted(value: string): boolean {
  return /^".*"$/.test(value);
}

type Algorithm = "sha256" | "sha384" | "sha512";

type HashSource = `'${Algorithm}-${string}'`;

export type QuotedSource =
  | "'self'"
  | "'none'"
  | "'unsafe-inline'"
  | "'unsafe-eval'"
  | "'wasm-unsafe-eval'"
  | "'unsafe-hashes'"
  | `'nonce-${string}'`
  | "'strict-dynamic'"
  | "'report-sample'"
  | HashSource;

export let SELF = "'self'" as const;
export let NONE = "'none'" as const;
export let UNSAFE_INLINE = "'unsafe-inline'" as const;
export let UNSAFE_EVAL = "'unsafe-eval'" as const;
export let WASM_UNSAFE_EVAL = "'wasm-unsafe-eval'" as const;
export let UNSAFE_HASHES = "'unsafe-hashes'" as const;
export let STRICT_DYNAMIC = "'strict-dynamic'" as const;
export let REPORT_SAMPLE = "'report-sample'" as const;
export function NONCE(nonce: string): `'nonce-${string}'` {
  return `'nonce-${nonce}'`;
}
export function HASH(algorithm: Algorithm, hash: string): HashSource {
  return `'${algorithm}-${hash}'`;
}

function isObject(value: unknown) {
  return value !== null && typeof value === "object";
}

export function mergeHeaders(...sources: HeadersInit[]): Headers {
  let result = new Headers();

  for (let source of sources) {
    if (!isObject(source)) {
      throw new TypeError("All arguments must be of type object");
    }

    let headers = new Headers(source);

    for (let [key, value] of headers.entries()) {
      if (value === undefined || value === "undefined") {
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

export function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}
