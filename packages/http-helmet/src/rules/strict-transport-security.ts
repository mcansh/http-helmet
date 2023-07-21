export type StrictTransportSecurity = {
  maxAge: number;
  includeSubDomains?: boolean;
  preload?: boolean;
};

export function createStrictTransportSecurity(
  options: StrictTransportSecurity,
): string {
  let header = `max-age=${options.maxAge}`;

  if (options.includeSubDomains) {
    header += "; includeSubDomains";
  }

  if (options.preload) {
    header += "; preload";
  }

  return header;
}
