import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import CryptoJS from 'crypto-js'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
   try {
       const { password, searchTerm = '', category = 'all', status = 'all', page = 1, limit = 20 } = await request.json()

       if (!password) {
           return NextResponse.json(
               { error: 'Password is required' },
               { status: 400 }
           )
       }

       const CORRECT_PASSWORD = process.env.PASSWORD!
       const isCorrect = password === CORRECT_PASSWORD

       // Calculate pagination
       const skip = (page - 1) * limit
       const take = parseInt(limit.toString())

       // Build where clause for category and status filter
       let whereClause: any = {}
       if (category !== 'all') {
           whereClause.category = category
       }
       
       // Add status filter
       if (status !== 'all') {
           if (status === 'hide-spam') {
               whereClause.status = { not: 'spam' }
           } else {
               whereClause.status = status
           }
       }

       // Get total count for pagination
       const totalCount = await prisma.feedback.count({
           where: whereClause
       })

       // Get status breakdown counts (for the current filter)
       const statusCounts = await prisma.feedback.groupBy({
           by: ['status'],
           where: category !== 'all' ? { category } : {}, // Only apply category filter for breakdown
           _count: {
               status: true
           }
       })

       // Convert to object for easier access
       const statusBreakdown = {
           pending: 0,
           acknowledged: 0,
           rejected: 0,
           spam: 0
       }
       
       statusCounts.forEach(item => {
           statusBreakdown[item.status as keyof typeof statusBreakdown] = item._count.status
       })

       // Fetch feedbacks with pagination
       const encryptedFeedbacks = await prisma.feedback.findMany({
           where: whereClause,
           skip,
           take,
           orderBy: {
               created_at: 'desc'
           }
       })

       // Decrypt all feedbacks
       const decryptedFeedbacks = encryptedFeedbacks.map(feedback => {
           try {
               const decryptedText = CryptoJS.AES.decrypt(
                   feedback.encrypted_feedback,
                   password
               ).toString(CryptoJS.enc.Utf8)

               // If decryption fails (wrong password), show encrypted text
               if (!decryptedText) {
                   return {
                       id: feedback.id,
                       feedback: feedback.encrypted_feedback,
                       category: feedback.category,
                       created_at: feedback.created_at.toISOString(),
                       status: feedback.status,
                       reviewed_at: feedback.reviewed_at?.toISOString() || null
                   }
               }

               return {
                   id: feedback.id,
                   feedback: decryptedText,
                   category: feedback.category,
                   created_at: feedback.created_at.toISOString(),
                   status: feedback.status,
                   reviewed_at: feedback.reviewed_at?.toISOString() || null
               }
           } catch (error) {
               // If decryption fails, return encrypted text
               return {
                   id: feedback.id,
                   feedback: feedback.encrypted_feedback,
                   category: feedback.category,
                   created_at: feedback.created_at.toISOString(),
                   status: feedback.status,
                   reviewed_at: feedback.reviewed_at?.toISOString() || null
               }
           }
       })

       // Filter by search term if provided
       let filteredFeedbacks = decryptedFeedbacks
       if (searchTerm.trim()) {
           filteredFeedbacks = decryptedFeedbacks.filter(feedback =>
               feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase())
           )
       }

       // Calculate if there are more pages
       const hasMore = skip + take < totalCount

       return NextResponse.json({
           feedbacks: filteredFeedbacks,
           isCorrect,
           hasMore,
           total: totalCount,
           statusBreakdown, // NEW
           page,
           limit
       })

   } catch (error) {
       console.error('Error fetching feedbacks:', error)
       return NextResponse.json(
           { error: 'Internal server error' },
           { status: 500 }
       )
   }
}