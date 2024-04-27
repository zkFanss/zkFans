import { NextRequest } from "next/server";
import { ParsedUrlQuery } from "querystring";
import { Hex } from "viem";
import IPFSClient from "~~/services/store/IPFS";
import { HttpCode, HttpMessage } from "~~/types";

export async function encryptUploadMiddleware(req: NextRequest) {
  try {
    const ipfsClient = await IPFSClient.getInstance();
    if (!req.formData) {
      return {
        status: HttpCode.NO_CONTENT,
        message: HttpMessage.NO_CONTENT,
      };
    }

    const formData = await req.formData();
    const entries = Object.fromEntries(formData.entries());
    const { pubKey, file } = entries;
    const hash = await ipfsClient.upload(pubKey as Hex, file as File);
    return {
      status: HttpCode.CREATED,
      message: HttpMessage.CREATED,
      hash,
    };
  } catch (error) {
    return {
      status: HttpCode.BAD_REQUEST,
      message: HttpMessage.BAD_REQUEST,
      module: "encryptUploadMiddleware",
      error,
    };
  }
}

export async function decryptDownloadMiddleware(params: ParsedUrlQuery) {
  try {
    const { hash } = params;
    const ipfsClient = await IPFSClient.getInstance();
    const file = await ipfsClient.download(hash as Hex);
    return {
      status: HttpCode.OK,
      message: HttpMessage.OK,
      file,
    };
  } catch (error) {
    return {
      status: HttpCode.NOT_FOUND,
      message: HttpMessage.NOT_FOUND,
      module: "decryptDownloadMiddleware",
      error,
    };
  }
}
