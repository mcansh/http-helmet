export function isQuoted(value: string): boolean {
  return /^".*"$/.test(value);
}

export function dashify(string: string): string {
  return string.replace(/[A-Z]/g, (capitalLetter) => {
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
