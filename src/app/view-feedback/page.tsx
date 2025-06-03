'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Eye, EyeOff, Loader2, Search, Check, X, AlertTriangle } from "lucide-react"
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

const statusOptions = [
    { id: 'all', label: 'All Status', icon: '📋' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'acknowledged', label: 'Acknowledged', icon: '✅' },
    { id: 'rejected', label: 'Rejected', icon: '❌' },
    { id: 'spam', label: 'Spam', icon: '⚠️' },
    { id: 'hide-spam', label: 'Hide Spam', icon: '🚫' }
]

interface Feedback {
    id: string
    feedback: string
    category: string
    created_at: string
    status: string
    reviewed_at: string | null
}

export default function FeedbackPage() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [isCorrect, setIsCorrect] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState<{ feedbackId: string, action: string } | null>(null)
    const [statusBreakdown, setStatusBreakdown] = useState({
        pending: 0,
        acknowledged: 0,
        rejected: 0,
        spam: 0
    })
    const [totalCount, setTotalCount] = useState(0)

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
                    status: 'all',
                    page: 1,
                    limit: 20
                })
            })

            const data = await response.json()

            if (response.ok) {
                if (data.isCorrect) {
                    localStorage.setItem('_mf_fm_psd', password.trim())
                }

                setFeedbacks(data.feedbacks)
                setIsCorrect(data.isCorrect)
                setHasMore(data.hasMore)
                setIsAuthenticated(true)
                setPage(1)
                setStatusBreakdown(data.statusBreakdown || { pending: 0, acknowledged: 0, rejected: 0, spam: 0 }) // NEW
                setTotalCount(data.total || 0) // NEW
            } else {
                console.error('Error fetching feedbacks')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmitWithStoredPassword = async (storedPassword: string) => {
        setIsLoading(true)

        try {
            const response = await fetch('/api/view-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: storedPassword,
                    searchTerm: '',
                    category: 'all',
                    status: 'all',
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
                setStatusBreakdown(data.statusBreakdown || { pending: 0, acknowledged: 0, rejected: 0, spam: 0 }) // NEW
                setTotalCount(data.total || 0) // NEW

                // If wrong password, clear localStorage
                if (!data.isCorrect) {
                    localStorage.removeItem('_mf_fm_psd')
                }
            } else {
                console.error('Error fetching feedbacks')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }


    const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
        // Get the current status before update
        const currentFeedback = feedbacks.find(f => f.id === feedbackId)
        const oldStatus = currentFeedback?.status

        setUpdatingStatus({ feedbackId, action: newStatus })
        try {
            const response = await fetch('/api/update-feedback-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password.trim(),
                    feedbackId,
                    status: newStatus
                })
            })

            if (response.ok) {
                // Update the feedback in the list
                setFeedbacks(prev => prev.map(feedback =>
                    feedback.id === feedbackId
                        ? { ...feedback, status: newStatus, reviewed_at: new Date().toISOString() }
                        : feedback
                ))

                // Update status breakdown counts - NEW
                if (oldStatus && oldStatus !== newStatus) {
                    setStatusBreakdown(prev => ({
                        ...prev,
                        [oldStatus]: Math.max(0, prev[oldStatus as keyof typeof prev] - 1), // Decrease old status
                        [newStatus]: prev[newStatus as keyof typeof prev] + 1 // Increase new status
                    }))
                }
            } else {
                console.error('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setUpdatingStatus(null)
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
                    status: selectedStatus,
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
            const response = await fetch('/api/view-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password.trim(),
                    searchTerm,
                    category: selectedCategory,
                    status: selectedStatus,
                    page: 1,
                    limit: 9999
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setHasMore(false)
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
                    status: selectedStatus,
                    page: 1,
                    limit: 20
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setHasMore(data.hasMore)
                setPage(1)
                setStatusBreakdown(data.statusBreakdown || { pending: 0, acknowledged: 0, rejected: 0, spam: 0 }) // NEW
                setTotalCount(data.total || 0) // NEW
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'acknowledged':
                return <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
                    ✅ Acknowledged
                </Badge>
            case 'rejected':
                return <Badge variant="destructive" className="gap-1">
                    ❌ Rejected
                </Badge>
            case 'spam':
                return <Badge variant="outline" className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                    ⚠️ Spam
                </Badge>
            default:
                return <Badge variant="secondary" className="gap-1">
                    ⏳ Pending
                </Badge>
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            handleSearch()
        }
    }, [selectedCategory, selectedStatus])

    useEffect(() => {
        const storedPassword = localStorage.getItem('_mf_fm_psd')
        if (storedPassword) {
            setPassword(storedPassword)
            // Auto-submit with stored password
            handlePasswordSubmitWithStoredPassword(storedPassword)
        }
    }, [])

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
                        <AlertCircle className="h-4 w-4 mt-1.75" />
                        <AlertDescription className="flex items-center justify-between">
                            <span className='text-destructive'>Seeing gibberish? It's because you entered the wrong password ;)</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    localStorage.removeItem('_mf_fm_psd')  // Add this line
                                    setIsAuthenticated(false)
                                    setPassword('')
                                    setFeedbacks([])
                                }}
                                className="ml-4 hover:cursor-pointer"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}


                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-mono font-medium">{feedbacks.length}</span> of{' '}
                                <span className="font-mono font-medium">{totalCount}</span> total feedback
                                {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                                    <span className="ml-2 text-xs">
                                        (filtered{selectedCategory !== 'all' && ` • ${getCategoryLabel(selectedCategory)}`}
                                        {selectedStatus !== 'all' && ` • ${selectedStatus}`}
                                        {searchTerm && ` • "${searchTerm}"`})
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary" className="gap-1 text-xs">
                                ⏳ {statusBreakdown.pending} pending
                            </Badge>
                            <Badge variant="default" className="gap-1 text-xs bg-green-100 text-green-800 border-green-200">
                                ✅ {statusBreakdown.acknowledged} acknowledged
                            </Badge>
                            <Badge variant="destructive" className="gap-1 text-xs">
                                ❌ {statusBreakdown.rejected} rejected
                            </Badge>
                            <Badge variant="outline" className="gap-1 text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                ⚠️ {statusBreakdown.spam} spam
                            </Badge>
                        </div>
                    </div>
                </div>
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

                    {/* Status filter - only show if correct password */}
                    {isCorrect && (
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full md:w-48 hover:cursor-pointer">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.id} value={status.id} className='hover:cursor-pointer'>
                                        <div className="flex items-center gap-2">
                                            <span>{status.icon}</span>
                                            <span>{status.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

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
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="outline" className="gap-1">
                                        <span>{categories.find(cat => cat.id === feedback.category)?.icon}</span>
                                        {getCategoryLabel(feedback.category)}
                                    </Badge>
                                    {getStatusBadge(feedback.status)}
                                </div>

                                {/* Action buttons - only show if correct password */}
                                {isCorrect && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateFeedbackStatus(feedback.id, 'acknowledged')}
                                            disabled={
                                                (updatingStatus?.feedbackId === feedback.id && updatingStatus?.action === 'acknowledged') ||
                                                feedback.status === 'acknowledged'
                                            }
                                            className="h-8 px-2 w-8 hover:cursor-pointer"
                                        >
                                            {updatingStatus?.feedbackId === feedback.id && updatingStatus?.action === 'acknowledged' ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>✅</>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateFeedbackStatus(feedback.id, 'rejected')}
                                            disabled={
                                                (updatingStatus?.feedbackId === feedback.id && updatingStatus?.action === 'rejected') ||
                                                feedback.status === 'rejected'
                                            }
                                            className="h-8 w-8 px-2 hover:cursor-pointer"
                                        >
                                            {updatingStatus?.feedbackId === feedback.id && updatingStatus?.action === 'rejected' ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>❌</>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateFeedbackStatus(feedback.id, 'spam')}
                                            disabled={
                                                (updatingStatus?.feedbackId === feedback.id && updatingStatus?.action === 'spam') ||
                                                feedback.status === 'spam'
                                            }
                                            className="h-8 px-2 w-8 hover:cursor-pointer"
                                        >
                                            {updatingStatus?.feedbackId === feedback.id && updatingStatus?.action === 'spam' ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>⚠️</>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {feedback.feedback}
                            </p>

                            {/* Show review timestamp if reviewed */}
                            {feedback.reviewed_at && isCorrect && (
                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                    Reviewed on {new Date(feedback.reviewed_at).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Load More */}
                {feedbacks.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No feedback found</p>
                    </div>
                )}
                {/* Loaded Count - NEW SECTION */}
                {feedbacks.length > 0 && (
                    <div className="text-center mt-4 mb-2 ">
                        <p className="text-sm text-muted-foreground font-mono">
                            Loaded {feedbacks.length} of {totalCount} feedback
                            {hasMore && ` • ${totalCount - feedbacks.length} more available`}
                        </p>
                    </div>
                )}
                {hasMore && feedbacks.length > 0 && (
                    <div className="flex items-center justify-center mt-8 gap-4">
                        <Button
                            onClick={loadMoreFeedbacks}
                            disabled={loadingMore}
                            variant="outline"
                            className="font-mono w-44 h-10 hover:cursor-pointer"
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
                            className="font-mono w-44 h-10 hover:cursor-pointer"
                        >
                            Load All Feedback
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}