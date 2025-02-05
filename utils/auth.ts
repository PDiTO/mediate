import {
  createSiweMessage,
  generateSiweNonce,
  verifySiweMessage,
} from "viem/siwe";

export function createSignedMessage(address: `0x${string}`, chainId: number) {
  return createSiweMessage({
    address: address,
    chainId: chainId,
    domain: window.location.host,
    nonce: generateSiweNonce(),
    uri: window.location.origin + window.location.pathname,
    version: "1",
    statement: "Sign in to Mediate Platform",
  });
}
