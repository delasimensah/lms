// import Stripe from "stripe";
// import { currentUser } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { stripe } from "@/lib/stripe";

// export async function POST(
//   req: Request,
//   { params }: { params: { courseId: string } }
// ) {
//   try {
//     const user = await currentUser();

//     if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const course = await db.course.findUnique({
//       where: {
//         id: params.courseId,
//         isPublished: true,
//       }
//     });

//     const purchase = await db.purchase.findUnique({
//       where: {
//         userId_courseId: {
//           userId: user.id,
//           courseId: params.courseId
//         }
//       }
//     });

//     if (purchase) {
//       return new NextResponse("Already purchased", { status: 400 });
//     }

//     if (!course) {
//       return new NextResponse("Not found", { status: 404 });
//     }

//     const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
//       {
//         quantity: 1,
//         price_data: {
//           currency: "USD",
//           product_data: {
//             name: course.title,
//             description: course.description!,
//           },
//           unit_amount: Math.round(course.price! * 100),
//         }
//       }
//     ];

//     let stripeCustomer = await db.stripeCustomer.findUnique({
//       where: {
//         userId: user.id,
//       },
//       select: {
//         stripeCustomerId: true,
//       }
//     });

//     if (!stripeCustomer) {
//       const customer = await stripe.customers.create({
//         email: user.emailAddresses[0].emailAddress,
//       });

//       stripeCustomer = await db.stripeCustomer.create({
//         data: {
//           userId: user.id,
//           stripeCustomerId: customer.id,
//         }
//       });
//     }

//     const session = await stripe.checkout.sessions.create({
//       customer: stripeCustomer.stripeCustomerId,
//       line_items,
//       mode: 'payment',
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
//       metadata: {
//         courseId: course.id,
//         userId: user.id,
//       }
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.log("[COURSE_ID_CHECKOUT]", error);
//     return new NextResponse("Internal Error", { status: 500 })
//   }
// }

// import axios from "axios";
// import { NextResponse } from "next/server";

// import prismadb from "@/lib/prismadb";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// type Params = {
//   params: {
//     storeId: string;
//   };
// };

// export async function POST(req: Request, { params }: Params) {
//   const {
//     productIds,
//     totalPrice,
//     customerName,
//     customerEmail,
//     customerPhoneNumber,
//     customerAddress,
//   } = await req.json();

//   if (!productIds || productIds.length === 0) {
//     return new NextResponse("Product ids are required", { status: 400 });
//   }

//   const response = await axios.post(
//     "https://api.paystack.co/transaction/initialize",
//     {
//       email: customerEmail,
//       amount: totalPrice,
//     },
//     {
//       headers: {
//         Authorization: `BEARER ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     },
//   );

//   await prismadb.order.create({
//     data: {
//       storeId: params.storeId,
//       isPaid: false,
//       phone: customerPhoneNumber,
//       address: customerAddress,
//       email: customerEmail,
//       name: customerName,
//       trxRef: response.data.data.reference as string,
//       orderItems: {
//         create: productIds.map((productId: string) => ({
//           product: {
//             connect: {
//               id: productId,
//             },
//           },
//         })),
//       },
//     },
//   });

//   return NextResponse.json(
//     { url: response.data.data.authorization_url },
//     {
//       headers: corsHeaders,
//     },
//   );
// }

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   const reference = searchParams.get("trxref");

//   const response = await axios.get(
//     `https://api.paystack.co/transaction/verify/${reference}`,
//     {
//       headers: {
//         Authorization: `BEARER ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     },
//   );

//   return NextResponse.json(
//     { status: response.data.status },
//     {
//       headers: corsHeaders,
//     },
//   );
// }