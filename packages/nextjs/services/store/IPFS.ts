import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import { CID } from "multiformats";

const contentTable = new Map<string, CID>();

const getInstance = async () => {
  const helia = await createHelia();
  return unixfs(helia);
};

const ipfsClientInstance = await getInstance();

const upload = async (file: Express.Multer.File) => {
  try {
    const { filename, buffer } = file;
    const cid = await ipfsClientInstance.addBytes(buffer);
    contentTable.set(filename, cid);
  } catch (error) {
    console.error(error);
  }
};

const download = async (fileName: string) => {
  try {
    const cid = contentTable.get(fileName);
    const decoder = new TextDecoder();
    let res;

    if (cid) {
      for await (const chunk of ipfsClientInstance.cat(cid)) {
        res = decoder.decode(chunk);
      }
    }

    return res;
  } catch (error) {
    console.error(error);
  }
};

export const ipfsClient = {
  upload,
  download,
};
