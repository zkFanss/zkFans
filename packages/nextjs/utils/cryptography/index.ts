import { Hex, bytesToHex, bytesToString, hexToBytes, stringToBytes } from "viem";

const base64ToArrayBuffer = (base64: string) => {
  const binaryString = Buffer.from(base64, "base64").toString("binary");
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const decryptPayload = async (encryptedMessage: { hash: Hex }) => {
  const { hash } = encryptedMessage;
  const bytes = hexToBytes(hash);
  const parsedMessage = JSON.parse(bytesToString(bytes));
  const fileContentArrayBuffer = base64ToArrayBuffer(parsedMessage.message);

  return {
    fileType: parsedMessage.fileType,
    fileName: parsedMessage.fileName,
    fileSize: parsedMessage.fileSize,
    contentBuffer: fileContentArrayBuffer,
  };
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, "binary").toString("base64");
};

const encryptPayload = async (file: File) => {
  const fileContent = await file.arrayBuffer();
  const base64FileContent = arrayBufferToBase64(fileContent);

  const buffer = stringToBytes(
    JSON.stringify({
      message: base64FileContent,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  );

  return bytesToHex(buffer);
};

const cryptographyUtils = {
  encryptPayload,
  decryptPayload,
};

export default cryptographyUtils;
