import pinataSDK from "@pinata/sdk";
import cryptographyUtils from "~~/utils/cryptography";

class IPFSClient {
  private static instance: IPFSClient;
  private pinata;

  private constructor() {
    this.pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
  }

  public static async getInstance(): Promise<IPFSClient> {
    if (!IPFSClient.instance) {
      IPFSClient.instance = new IPFSClient();
    }
    return IPFSClient.instance;
  }
  public async upload(data: FormData) {
    try {
      const entries = Object.fromEntries(data.entries());
      const { pubKey, file } = entries;
      const shortenedPubKey = `${pubKey.slice(0, 4)}...${pubKey.slice(-5)}`;
      const currentDate = new Date().toISOString();
      const metadata = {
        pinataMetadata: {
          name: `${shortenedPubKey}-${currentDate}.json`,
        },
      };
      const hash = await cryptographyUtils.encryptPayload(file as File);
      const payload = {
        hash,
      };
      const { IpfsHash } = await this.pinata.pinJSONToIPFS(payload, metadata);
      return IpfsHash;
    } catch (error) {
      console.error("{ component: IPFSClient, service: upload }: ", error);
    }
  }

  public async download(hash: string) {
    try {
      const res = await fetch(`https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`, {
        method: "GET",
      });
      const payload = await res.json();
      const file = await cryptographyUtils.decryptPayload(payload);
      return file;
    } catch (error) {
      console.error("{ component: IPFSClient, service: download }: ", error);
    }
  }
}

export default IPFSClient;
