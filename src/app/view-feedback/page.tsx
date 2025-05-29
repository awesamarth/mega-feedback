'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Eye, EyeOff, Loader2, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const categories = [
    { id: 'all', label: 'All Categories', icon: '📝' },
    { id: 'speed_performance', label: 'Speed & Performance', icon: '⚡' },
    { id: 'ease_of_use', label: 'Ease of Use', icon: '🎯' },
    { id: 'ideas_requests', label: 'Ideas & Requests', icon: '💡' },
    { id: 'community_support', label: 'Community & Support', icon: '🤝' },
    { id: 'developer_experience', label: 'Developer Experience', icon: '⚙️' },
    { id: 'other', label: 'Other', icon: '📝' }
]

interface Feedback {
    id: string
    feedback: string
    category: string
    created_at: string
}

export default function FeedbackPage() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isCorrect, setIsCorrect] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)

    const handlePasswordSubmit = async () => {
        if (!password.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/view-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password.trim(),
                    searchTerm: '',
                    category: 'all',
                    page: 1,
                    limit: 20
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setIsCorrect(data.isCorrect)
                setHasMore(data.hasMore)
                setIsAuthenticated(true)
                setPage(1)
            } else {
                console.error('Error fetching feedbacks')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreFeedbacks = async () => {
        if (!hasMore || loadingMore) return

        setLoadingMore(true)
        try {
            const response = await fetch('/api/view-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password.trim(),
                    searchTerm,
                    category: selectedCategory,
                    page: page + 1,
                    limit: 20
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(prev => [...prev, ...data.feedbacks])
                setHasMore(data.hasMore)
                setPage(prev => prev + 1)
            }
        } catch (error) {
            console.error('Error loading more:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    const loadAllFeedbacks = async () => {
        if (!hasMore || loadingMore) return

        setLoadingMore(true)
        try {
            // Load all remaining in one go
            const response = await fetch('/api/view-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password.trim(),
                    searchTerm,
                    category: selectedCategory,
                    page: 1,
                    limit: 9999 // Load everything
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setHasMore(false) // No more to load
                setPage(1)
            }
        } catch (error) {
            console.error('Error loading all:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    const handleSearch = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/view-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password.trim(),
                    searchTerm,
                    category: selectedCategory,
                    page: 1,
                    limit: 20
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setHasMore(data.hasMore)
                setPage(1)
            }
        } catch (error) {
            console.error('Error searching:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getCategoryLabel = (categoryId: string) => {
        return categories.find(cat => cat.id === categoryId)?.label || categoryId
    }

    useEffect(() => {
        if (isAuthenticated) {
            handleSearch()
        }
    }, [selectedCategory])

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background">
                <div className="h-20"></div>

                <div className="max-w-xl mx-auto px-6 py-12">
                    <Card className='py-10'>
                        <CardHeader className="text-center">
                            <CardTitle className="font-mono text-xl">View Feedback</CardTitle>
                            <CardDescription className="text-base">
                                Enter password to decrypt and view anonymous feedback
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-base font-mono font-medium">Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e: any) => setPassword(e.target.value)}
                                        placeholder="Enter decryption password"
                                        onKeyPress={(e: any) => e.key === 'Enter' && handlePasswordSubmit()}
                                    />

                                </div>
                            </div>

                            <Button
                                onClick={handlePasswordSubmit}
                                disabled={!password.trim() || isLoading}
                                className="w-full font-mono hover:cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Decrypting...
                                    </>
                                ) : (
                                    'View Feedback'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }





    return (
        <div className="min-h-screen bg-background">
            <div className="h-20"></div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-mono mb-2">Anonymous Feedback</h1>
                    <p className="text-muted-foreground">Decrypted feedback submissions</p>
                </div>

                {/* Wrong password alert */}
                {!isCorrect && (
                    <Alert className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription >
                            <span className='text-destructive'>Seeing gibberish? It's because you entered the wrong password ;{`)`}</span>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search feedback content..."
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                            onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-48 hover:cursor-pointer">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className='hover:cursor-pointer'>
                                    <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        <span>{category.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button className="hover:cursor-pointer" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                    </Button>
                </div>

                {/* Feedback List */}
                <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="border rounded-lg p-6 bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Badge variant="outline" className="gap-1">
                                    <span>{categories.find(cat => cat.id === feedback.category)?.icon}</span>
                                    {getCategoryLabel(feedback.category)}
                                </Badge>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {feedback.feedback}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                {feedbacks.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No feedback found</p>
                    </div>
                )}

                {hasMore && feedbacks.length > 0 && (
                    <div className="text-center mt-8 space-y-4">
                        <Button
                            onClick={loadMoreFeedbacks}
                            disabled={loadingMore}
                            variant="outline"
                            className="font-mono mr-4 hover:cursor-pointer"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                'Load More Feedback'
                            )}
                        </Button>

                        <Button
                            onClick={() => loadAllFeedbacks()}
                            disabled={loadingMore}
                            variant="default"
                            className="font-mono hover:cursor-pointer"
                        >
                            Load All Feedback
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}