import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import CryptoJS from 'crypto-js'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
   try {
       const { password, searchTerm = '', category = 'all', page = 1, limit = 20 } = await request.json()

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

       // Build where clause for category filter
       let whereClause: any = {}
       if (category !== 'all') {
           whereClause.category = category
       }

       // Get total count for pagination
       const totalCount = await prisma.feedback.count({
           where: whereClause
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
                       created_at: feedback.created_at.toISOString()
                   }
               }

               return {
                   id: feedback.id,
                   feedback: decryptedText,
                   category: feedback.category,
                   created_at: feedback.created_at.toISOString()
               }
           } catch (error) {
               // If decryption fails, return encrypted text
               return {
                   id: feedback.id,
                   feedback: feedback.encrypted_feedback,
                   category: feedback.category,
                   created_at: feedback.created_at.toISOString()
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