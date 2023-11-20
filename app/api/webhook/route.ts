// import Stripe from "stripe";
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";

// import { stripe } from "@/lib/stripe";
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   const body = await req.text();
//   const signature = headers().get("Stripe-Signature") as string;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     )
//   } catch (error: any) {
//     return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
//   }

//   const session = event.data.object as Stripe.Checkout.Session;
//   const userId = session?.metadata?.userId;
//   const courseId = session?.metadata?.courseId;

//   if (event.type === "checkout.session.completed") {
//     if (!userId || !courseId) {
//       return new NextResponse(`Webhook Error: Missing metadata`, { status: 400 });
//     }

//     await db.purchase.create({
//       data: {
//         courseId: courseId,
//         userId: userId,
//       }
//     });
//   } else {
//     return new NextResponse(`Webhook Error: Unhandled event type ${event.type}`, { status: 200 })
//   }

//   return new NextResponse(null, { status: 200 });
// }

// import { headers } from "next/headers";
// import { NextResponse } from "next/server";

// import prismadb from "@/lib/prismadb";

// export async function POST(req: Request) {
//   const event = await req.json();
//   const signature = headers().get("x-paystack-signature") as string;

//   if (!signature) {
//     return new NextResponse("No Signature", { status: 400 });
//   }

//   if (event.event === "charge.success") {
//     await prismadb.order.update({
//       where: {
//         trxRef: event.data.reference,
//       },
//       data: {
//         isPaid: true,
//       },
//       include: {
//         orderItems: true,
//       },
//     });

//     //   const productIds = order.orderItems.map((orderItem) => orderItem.productId);
//     //   await prismadb.product.updateMany({
//     //     where: {
//     //       id: {
//     //         in: [...productIds],
//     //       },
//     //     },
//     //     data: {
//     //       isArchived: true,
//     //     },
//     //   });
//   }

//   return new NextResponse(null, { status: 200 });
// }
