import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(req: Request) {
  const event = await req.json();
  const signature = headers().get("x-paystack-signature") as string;

  if (!signature) {
    return new NextResponse("No Signature", { status: 400 });
  }

  if (event.event === "charge.success") {
    await db.purchase.create({
      data: {
        courseId: event.data.metadata.courseId,
        userId: event.data.metadata.userId,
      },
    });
  } else {
  }

  return new NextResponse(null, { status: 200 });
}
