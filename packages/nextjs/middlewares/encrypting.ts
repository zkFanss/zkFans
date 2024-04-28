import { NextRequest } from "next/server";
import { ParsedUrlQuery } from "querystring";
import IPFSClient from "~~/services/store/IPFS";
import { HttpCode, HttpMessage } from "~~/types";

export async function encryptUploadMiddleware(req: NextRequest) {
  try {
    const formData = await req.formData();
    const ipfsClient = await IPFSClient.getInstance();
    const hash = await ipfsClient.upload(formData);
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
    const file = await ipfsClient.download(hash as string);
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
