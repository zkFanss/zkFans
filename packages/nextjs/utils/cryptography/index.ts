import { ByteArray, Hex, bytesToHex, bytesToString, hexToBytes, stringToBytes } from "viem";

const decryptPayload = async (encryptedMessage: Hex) => {
  let buffer: ByteArray;
  encryptedMessage.startsWith("0x")
    ? (buffer = hexToBytes(encryptedMessage))
    : (buffer = hexToBytes(`0x${encryptedMessage}`));

  const payload = JSON.parse(bytesToString(buffer));
  return payload;
};

const encryptPayload = async <T>(pubKey: string, payload: T) => {
  const buffer = stringToBytes(
    JSON.stringify({
      message: payload,
      encryptionKeys: pubKey,
    }),
  );

  return bytesToHex(buffer);
};

const cryptographyUtils = {
  encryptPayload,
  decryptPayload,
};

export default cryptographyUtils;
