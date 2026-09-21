import { createHash } from "node:crypto";
export const CryptoDigestAlgorithm = { SHA256: "sha256" };
export async function digestStringAsync(algorithm, value) {
  return createHash(algorithm).update(value).digest("hex");
}
