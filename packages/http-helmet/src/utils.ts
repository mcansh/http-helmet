export function isQuoted(value: string): boolean {
  return /^".*"$/.test(value);
}

export function convertCamelToDash(input: string): string {
  return input.replace(/[A-Z]/g, (capitalLetter) => {
    return `-${capitalLetter.toLowerCase()}`;
  });
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
