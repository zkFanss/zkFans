import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import { CID } from "multiformats";
import { Hex } from "viem";
import cryptographyUtils from "~~/utils/cryptography";

class IPFSClient {
  private static instance: IPFSClient;
  private contentTable: Map<Hex, CID>;
  private ipfsClientInstance: any;

  private constructor() {
    this.contentTable = new Map<Hex, CID>();
    this.initializeInstance();
  }

  public static getInstance(): IPFSClient {
    if (!IPFSClient.instance) {
      IPFSClient.instance = new IPFSClient();
    }
    return IPFSClient.instance;
  }

  private async initializeInstance() {
    const helia = await createHelia();
    this.ipfsClientInstance = unixfs(helia);
  }

  public async upload(file: File) {
    try {
      const hash = await cryptographyUtils.encryptPayload("", file);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const buffer = new Uint8Array(reader.result as ArrayBuffer);
          const cid = await this.ipfsClientInstance.addBytes(buffer);
          this.contentTable.set(hash, cid);
          resolve(cid);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error("{ component: IPFSClient, service: upload }: ", error);
    }
  }

  public async download(hashFile: Hex) {
    try {
      const cid = this.contentTable.get(hashFile);
      if (cid) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of this.ipfsClientInstance.cat(cid)) {
          chunks.push(chunk);
        }
        const fileBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          fileBuffer.set(chunk, offset);
          offset += chunk.length;
        }
        const file = await cryptographyUtils.decryptPayload(hashFile);
        return file;
      }
    } catch (error) {
      console.error("{ component: IPFSClient, service: download }: ", error);
    }
  }
}

export default IPFSClient;
