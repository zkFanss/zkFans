import { NextRequest, NextResponse } from "next/server";
import { GetServerSidePropsContext } from "next";
import { decryptDownloadMiddleware } from "~~/middlewares/encrypting";
import { HttpCode, HttpMessage } from "~~/types";

export async function GET(req: NextRequest, context: GetServerSidePropsContext) {
  try {
    const { params } = context;
    if (!params) throw new Error("No hash where given...");
    const result = await decryptDownloadMiddleware(params);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      status: HttpCode.BAD_REQUEST,
      message: HttpMessage.BAD_REQUEST,
      module: "GET /api/file",
      error,
    });
  }
}
