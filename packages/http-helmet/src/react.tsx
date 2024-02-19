import nodeCrypto from "node:crypto";
import * as React from "react";
import {
  CreateSecureHeaders,
  createSecureHeaders as createSecureHeadersImpl,
} from "./index";

let NonceContext = React.createContext<string | undefined>(undefined);
let NonceProvider = NonceContext.Provider;

export function useNonce(): string | undefined {
  return React.useContext(NonceContext);
}

function createNonce(): string {
  if ("randomUUID" in crypto) {
    return Buffer.from(crypto.randomUUID()).toString("hex");
  }
  return nodeCrypto.randomBytes(16).toString("hex");
}

export function createSecureHeaders(options: CreateSecureHeaders) {
  let nonce = createNonce();
  let headers = createSecureHeadersImpl(options);
  let Provider = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(NonceProvider, { value: nonce }, children);
  };

  return { nonce, headers, NonceProvider: Provider };
}
