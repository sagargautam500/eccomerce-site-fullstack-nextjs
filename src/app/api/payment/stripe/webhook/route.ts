// src/app/api/payment/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'


// Helper to read raw body
async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  const reader = readable.getReader()
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  
  return Buffer.concat(chunks)
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    console.error('❌ Missing Stripe signature')
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    const buf = await buffer(req.body as ReadableStream<Uint8Array>)
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Webhook signature verification failed:', errorMessage)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Update order status to "paid"
        const result = await prisma.order.updateMany({
          where: { 
            stripeCheckoutSession: session.id,
            status: { not: 'paid' } // Prevent duplicate processing
          },
          data: { 
            status: 'paid',
            stripePaymentIntentId: session.payment_intent as string || null,
          },
        })

        if (result.count > 0) {
          console.log(`✅ Payment successful for session ${session.id}`)
        } else {
          console.warn(`⚠️ No order found or already processed: ${session.id}`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const result = await prisma.order.updateMany({
          where: { 
            stripeCheckoutSession: session.id,
            status: 'pending'
          },
          data: { status: 'expired' },
        })

        if (result.count > 0) {
          console.log(`⚠️ Payment expired for session ${session.id}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'failed' },
        })

        console.log(`❌ Payment failed for intent ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Error handling webhook event:', errorMessage)
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable Next.js body parsing to get raw body
export const runtime = 'nodejs'