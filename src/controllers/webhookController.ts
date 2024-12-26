// import express, { Request, Response } from "express";
// import Stripe from "stripe";

// export class WebhookController {
//   private stripe: Stripe;
//   private endpointSecret: string;

//   constructor(stripeInstance: Stripe, endpointSecret: string) {
//     this.stripe = stripeInstance;
//     this.endpointSecret = endpointSecret;
//   }

//   public async handleWebhook(req: Request, res: Response): Promise<void> {
//     const sig = req.headers["stripe-signature"] as string;

//     if (!this.endpointSecret) {
//       console.error("STRIPE_WEBHOOK_SECRET is not set");
//       res.status(500).send("Webhook secret not configured");
//       return;
//     }

//     let event: Stripe.Event;

//     try {
//       event = this.stripe.webhooks.constructEvent(req.body, sig, this.endpointSecret);
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err);
//       res.status(400).send(`Webhook Error: ${(err as Error).message}`);
//       return;
//     }

//     // Route events based on type or metadata
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         await this.handlePaymentSuccess(event);
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     res.status(200).send("Webhook received");
//   }

//   private async handlePaymentSuccess(event: Stripe.Event) {
//     const paymentIntent = event.data.object as Stripe.PaymentIntent;

//     // Common metadata values
//     const appointmentId = paymentIntent.metadata?.appointmentId;
//     const userId = paymentIntent.metadata?.userId;
//     const amount = Number(paymentIntent.metadata?.amount);

//     try {
//       if (appointmentId) {
//         // Handle appointment payment
//         console.log(`Processing payment for appointment ID: ${appointmentId}`);
//         await this.processAppointmentPayment(appointmentId, userId, amount);
//       } else if (userId) {
//         // Handle premium subscription payment
//         console.log(`Processing premium subscription for user ID: ${userId}`);
//         await this.processPremiumPayment(userId);
//       } else {
//         console.warn("No relevant metadata found for payment processing.");
//       }
//     } catch (error) {
//       console.error("Error processing payment:", error);
//     }
//   }

//   private async processAppointmentPayment(appointmentId: string, userId: string, amount: number) {
//     const status = "completed";

//     // Update the appointment
//     await this.appointmentService.paymentSucceed(appointmentId);

//     // Add the payment
//     await this.paymentService.addPaymentService(userId, appointmentId, amount, status);
//     console.log(`Payment added for Appointment ID: ${appointmentId}`);
//   }

//   private async processPremiumPayment(userId: string) {
//     // Update user to premium
//     await this.userService.changeUserPremium(userId);
//     console.log(`User ${userId} upgraded to premium.`);
//   }
// }
