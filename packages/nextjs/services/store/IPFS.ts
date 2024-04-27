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
  }

  public static async getInstance(): Promise<IPFSClient> {
    if (!IPFSClient.instance) {
      IPFSClient.instance = new IPFSClient();
    }
    await IPFSClient.instance.initializeInstance();
    return IPFSClient.instance;
  }

  public async initializeInstance() {
    const helia = await createHelia();
    this.ipfsClientInstance = await unixfs(helia);
  }

  public async upload(pubKey: Hex, file: File) {
    try {
      const hash = await cryptographyUtils.encryptPayload(pubKey, file);
      const buffer = Buffer.from(await file.arrayBuffer());
      const cid = await this.ipfsClientInstance.addBytes(buffer);
      this.setCidMapping(hash, cid);
      return hash;
    } catch (error) {
      console.error("{ component: IPFSClient, service: upload }: ", error);
    }
  }

  public async download(hashFile: Hex) {
    try {
      const cid = this.getMappedCid(hashFile);

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

  private setCidMapping(hash: Hex, cid: CID) {
    return this.contentTable.set(hash, cid);
  }

  private getMappedCid(hash: Hex) {
    return this.contentTable.get(hash);
  }
}

export default IPFSClient;
