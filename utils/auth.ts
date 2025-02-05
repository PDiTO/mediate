import { createSiweMessage, SiweMessage } from "viem/siwe";
import { baseSepolia } from "viem/chains";

export function generateSiweMessage(address: `0x${string}`, nonce: string) {
  const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return createSiweMessage({
    address,
    chainId: baseSepolia.id,
    domain: window.location.host,
    uri: window.location.origin,
    version: "1",
    nonce,
    statement: "Sign in to Mediate",
    expirationTime: expirationDate,
  });
}
