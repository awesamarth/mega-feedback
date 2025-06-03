import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { password, feedbackId, status } = await request.json()

    // Validate password
    const CORRECT_PASSWORD = process.env.PASSWORD!
    if (!password || password !== CORRECT_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Validate inputs
    if (!feedbackId || !status) {
      return NextResponse.json(
        { error: 'Missing feedbackId or status' },
        { status: 400 }
      )
    }

    // Validate status values
    const validStatuses = ['pending', 'acknowledged', 'rejected', 'spam']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update feedback status
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status,
        reviewed_at: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      feedback: updatedFeedback 
    })

  } catch (error) {
    console.error('Error updating feedback status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}