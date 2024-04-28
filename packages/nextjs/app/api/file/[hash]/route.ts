import { NextRequest, NextResponse } from "next/server";
import { GetServerSidePropsContext } from "next";
import { decryptDownloadMiddleware } from "~~/middlewares/encrypting";
import { HttpCode, HttpMessage } from "~~/types";

export async function GET(req: NextRequest, context: GetServerSidePropsContext) {
  try {
    const { params } = context;
    if (!params) throw new Error("No hash was given...");
    const result = await decryptDownloadMiddleware(params);
    if (!result.file?.contentBuffer) throw new Error("No File content was given");
    const response = new NextResponse(result.file.contentBuffer);
    response.headers.set("Content-Type", result.file.fileType);
    response.headers.set("Content-Length", result.file.fileSize.toString());
    response.headers.set("Content-Disposition", `attachment; filename="${result.file.fileName}"`);

    return response;
  } catch (error) {
    return NextResponse.json({
      status: HttpCode.BAD_REQUEST,
      message: HttpMessage.BAD_REQUEST,
      module: "GET /api/file",
      error,
    });
  }
}
