import { type Token, getDecodedToken } from "@cashu/cashu-ts";
import { useMintsStore, WalletProof } from "src/stores/mints";
import { useProofsStore } from "src/stores/proofs";
export default { decode, getProofs, getMint, getUnit, getMemo };

/**
 * Decodes an encoded cashu token
 */
function decode(encoded_token: string | undefined): Token | undefined {
  if (!encoded_token || encoded_token === "") return;
  return getDecodedToken(encoded_token);
}

/**
 * Returns a list of proofs from a decoded token
 */
function getProofs(decoded_token: Token | undefined): WalletProof[] {
  if (!decoded_token || !(decoded_token.proofs.length > 0)) {
    throw new Error("Token format wrong");
  }
  const proofs = decoded_token.proofs.flat();
  return useProofsStore().proofsToWalletProofs(proofs);
}

function getMint(decoded_token: Token | undefined) {
  //Returns first mint of a token (very rough way).
  if (!decoded_token || !decoded_token.proofs) {
    return "";
  }
  return decoded_token.mint;
}

function getUnit(decoded_token: Token | undefined) {
  if (!decoded_token) {
    return "";
  }
  if (decoded_token.unit != null) {
    return decoded_token.unit;
  } else {
    // search for unit in mints[...].keysets[...].unit
    const mintStore = useMintsStore();
    const mint = getMint(decoded_token);
    const keysets = mintStore.mints
      .filter((m) => m.url === mint)
      .flatMap((m) => m.keysets);
    if (keysets.length > 0) {
      return keysets[0].unit;
    }
    return "";
  }
}

function getMemo(decoded_token: Token | undefined) {
  if (!decoded_token || decoded_token.memo != null) {
    return "";
  }
  if (decoded_token.memo != null) {
    return decoded_token.memo;
  }
}
