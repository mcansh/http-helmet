export type StrictTransportSecurity = {
  maxAge: number;
  includeSubDomains?: boolean;
  preload?: boolean;
};

export function createStrictTransportSecurity(
  options: StrictTransportSecurity,
): string;
export function createStrictTransportSecurity(options: true): string;
export function createStrictTransportSecurity(
  options: StrictTransportSecurity | true,
): string;
export function createStrictTransportSecurity(
  options: StrictTransportSecurity | true,
): string {
  if (options === true) {
    options = { maxAge: 15552000, includeSubDomains: true, preload: true };
  }

  let header = `max-age=${options.maxAge}`;

  if (options.includeSubDomains) {
    header += "; includeSubDomains";
  }

  if (options.preload) {
    header += "; preload";
  }

  return header;
}
