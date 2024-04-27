import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import { CID } from "multiformats";

class IPFSClient {
  private static instance: IPFSClient;
  private contentTable: Map<string, CID>;
  private ipfsClientInstance: any;

  private constructor() {
    this.contentTable = new Map<string, CID>();
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
      const { name } = file;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const buffer = new Uint8Array(reader.result as ArrayBuffer);
          const cid = await this.ipfsClientInstance.addBytes(buffer);
          this.contentTable.set(name, cid);
          resolve(cid);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error("{ component: IPFSClient, service: upload }: ", error);
    }
  }

  public async download(fileName: string) {
    try {
      const cid = this.contentTable.get(fileName);
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
        const file = new File([fileBuffer], fileName);
        return file;
      }
    } catch (error) {
      console.error("{ component: IPFSClient, service: download }: ", error);
    }
  }
}

export default IPFSClient;
