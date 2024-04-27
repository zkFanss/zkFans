import { NextRequest, NextResponse } from "next/server";
import { encryptUploadMiddleware } from "~~/middlewares/encrypting";
import { HttpCode, HttpMessage } from "~~/types";

export async function POST(req: NextRequest) {
  try {
    const result = await encryptUploadMiddleware(req);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      status: HttpCode.BAD_REQUEST,
      message: HttpMessage.BAD_REQUEST,
      module: "POST /api/file",
      error,
    });
  }
}
