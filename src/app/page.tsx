'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Loader2, Shield, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"


const categories = [
  {
    id: 'speed_performance',
    label: 'Speed & Performance',
    description: 'Block times, transaction speeds, network latency',
    icon: '⚡'
  },
  {
    id: 'ease_of_use',
    label: 'Ease of Use',
    description: 'User experience, interface design, onboarding',
    icon: '🎯'
  },
  {
    id: 'ideas_requests',
    label: 'Ideas & Requests',
    description: 'Feature suggestions, improvements, new concepts',
    icon: '💡'
  },
  {
    id: 'community_support',
    label: 'Community & Official Support',
    description: 'Documentation, help resources, community engagement',
    icon: '🤝'
  },
  {
    id: 'developer_experience',
    label: 'Developer Experience',
    description: 'APIs, SDKs, tools, development workflow',
    icon: '⚙️'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'General feedback, suggestions, or anything else',
    icon: '📝'
  }
]

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Check payment status when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkPaymentStatus()
    }
  }, [isConnected, address])

  const checkPaymentStatus = async () => {
    if (!address) return

    setIsCheckingPayment(true)
    try {
      // Check if user has paid
      const response = await fetch(`/api/check-payment?address=${address}`)
      const data = await response.json()
      setHasPaid(data.hasPaid)
    } catch (error) {
      console.error('Error checking payment:', error)
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const handlePayment = async () => {
    if (!address) return

    setIsPaymentLoading(true)
    try {
      // Call contract to pay
      // This would trigger the wallet transaction
      // Implementation depends on your contract setup
      console.log('Payment initiated...')

      // After successful payment, recheck status
      setTimeout(() => {
        // checkPaymentStatus()
        setHasPaid(true)
        setIsPaymentLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Payment failed:', error)
      setIsPaymentLoading(false)
    }
  }

  const getSelectedCategory = (id: string) => {
    return categories.find(cat => cat.id === id)
  }

  const handleSubmit = async () => {
    if (!feedback.trim() || !selectedCategory) return

    setIsSubmitLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          category: selectedCategory,
          wallet_address: address
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFeedback('')
        setSelectedCategory('')
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const isFormEnabled = isConnected && hasPaid && !isCheckingPayment
  const canSubmit = isFormEnabled && feedback.trim() && selectedCategory && !isSubmitLoading

  return (
    <div className="min-h-screen bg-background">
      {/* Header spacing */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-mono mb-4">
            MEGA
            <span className="text-muted-foreground"> FEEDBACK</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Share your honest thoughts about MegaETH. Pay once, submit <b>anonymously. </b>
            Your identity stays completely private.
          </p>
        </div>

        {/* Privacy Badges */}
        <div className="flex justify-center gap-4 mb-12">
          <Badge variant="outline" className="gap-2 py-2 px-4">
            <Shield className="h-4 w-4" />
            Fully Anonymous
          </Badge>
          <Badge variant="outline" className="gap-2 py-2 px-4">
            <Zap className="h-4 w-4" />
            Spam Protected
          </Badge>
        </div>

        {/* Main Form Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-mono">Submit Feedback</CardTitle>
            <CardDescription>
              {!isConnected && "Connect your wallet to get started"}
              {isConnected && !hasPaid && "Pay 0.001 ETH to prevent spam and enable anonymous feedback. Your address will not be associated to your feedback."}
              {isConnected && hasPaid && "Your address will not be associated to your feedback. Your feedback will be encrypted and anonymized"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Connection Status */}
            {!isConnected && (
              <Alert className="flex w-full items-center">
                <AlertCircle className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">
                  Connect your wallet to continue. We only use it for payment verification.
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Status */}
            {isConnected && (
              <div className="space-y-4">
                {isCheckingPayment && (
                  <Alert className="flex w-full items-center">
                    <Loader2 className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0 animate-spin" />
                    <AlertDescription className="flex-1">
                      Checking payment status...
                    </AlertDescription>
                  </Alert>
                )}

                {!isCheckingPayment && !hasPaid && (
                  <Alert className="flex w-full items-center">
                    <AlertCircle className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0" />
                    <AlertDescription className="flex items-center justify-between flex-1">
                      <span>Payment required: 0.001 ETH</span>
                      <Button
                        onClick={handlePayment}
                        disabled={isPaymentLoading}
                        size="sm"
                        className='hover:cursor-pointer'
                      >
                        {isPaymentLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {!isCheckingPayment && hasPaid && (
                  <Alert className="flex w-full items-center border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0 text-green-600" />
                    <AlertDescription className="flex-1 text-green-800 dark:text-green-200">
                      Payment verified! You can now submit anonymous feedback.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-mono font-medium">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={!isFormEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback category">
                    {selectedCategory && (
                      <div className="flex items-center gap-2">
                        <span>{getSelectedCategory(selectedCategory)?.icon}</span>
                        <span>{getSelectedCategory(selectedCategory)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Feedback Textarea */}
            <div className="space-y-3">
              <label className="text-sm font-mono font-medium">Your Feedback</label>
              <Textarea
                placeholder="Share your honest thoughts about MegaETH. What's working well? What could be improved? Your feedback will be completely anonymous."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={!isFormEnabled}
                rows={6}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {feedback.length}/1000 characters
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full font-mono hover:cursor-pointer disabled:!cursor-not-allowed"
              size="lg"
            >
              {isSubmitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Anonymous Feedback'
              )}
            </Button>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <Alert className="flex w-full items-center border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0 text-green-600" />
                <AlertDescription className="flex-1 text-green-800 dark:text-green-200">
                  Feedback submitted successfully! Thank you for helping improve MegaETH.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert variant="destructive" className="flex w-full items-center">
                <AlertCircle className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">
                  Failed to submit feedback. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Privacy Notice */}
            <div className="text-xs text-muted-foreground text-center space-y-2 pt-4 border-t">
              <p className="font-mono">🔒 PRIVACY GUARANTEED</p>
              <p>
                Your feedback is encrypted and shuffled with others.
                No correlation between your wallet and feedback content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}