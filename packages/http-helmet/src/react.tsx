// eslint-disable-next-line import/no-extraneous-dependencies
import * as React from "react";

let NonceContext = React.createContext<string | undefined>(undefined);

type NonceProviderProps = {
  nonce: string;
  children: React.ReactNode;
};

export function NonceProvider({ nonce, children }: NonceProviderProps) {
  return (
    <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
  );
}

export function useNonce(): string | undefined {
  return React.useContext(NonceContext);
}

export function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("hex");
}
