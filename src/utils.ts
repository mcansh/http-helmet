export function isQuoted(value: string): boolean {
  return /^".*"$/.test(value);
}

export function dashify(string: string): string {
  return string.replace(/[A-Z]/g, (capitalLetter) => {
    return `-${capitalLetter.toLowerCase()}`;
  });
}
