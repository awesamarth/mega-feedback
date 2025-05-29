import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import CryptoJS from 'crypto-js'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
 try {
   const PASSWORD = process.env.PASSWORD!

   if (!PASSWORD) {
     return NextResponse.json(
       { error: 'Password not configured' },
       { status: 500 }
     )
   }

   const { feedback, category, wallet_address } = await request.json()

   // Validate input
   if (!feedback || !category || !wallet_address) {
     return NextResponse.json(
       { error: 'Missing required fields' },
       { status: 400 }
     )
   }

   if (feedback.length > 1000) {
     return NextResponse.json(
       { error: 'Feedback too long (max 1000 characters)' },
       { status: 400 }
     )
   }

   // Encrypt the feedback
   const encryptedFeedback = CryptoJS.AES.encrypt(feedback, PASSWORD).toString()

   // Generate random timestamp (could be from 2002 lol)
   const randomTimestamp = new Date(
     Math.random() * (Date.now() - new Date('2002-01-01').getTime()) + new Date('2002-01-01').getTime()
   )

   // Store in database
   await prisma.feedback.create({
     data: {
       encrypted_feedback: encryptedFeedback,
       category,
       created_at: randomTimestamp
     }
   })

   return NextResponse.json({ success: true }, { status: 200 })

 } catch (error) {
   console.error('Error submitting feedback:', error)
   return NextResponse.json(
     { error: 'Internal server error' },
     { status: 500 }
   )
 }
}