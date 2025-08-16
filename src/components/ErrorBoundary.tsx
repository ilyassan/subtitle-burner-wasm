"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Bug, Download } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console for development
    console.error("Application Error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleDownloadErrorReport = () => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: this.state.error?.name,
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      errorInfo: this.state.errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  Something went wrong while processing your request. 
                  The application encountered an unexpected error.
                </AlertDescription>
              </Alert>

              {this.state.error && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Error Details:</h4>
                  <code className="text-sm text-muted-foreground break-all">
                    {this.state.error.name}: {this.state.error.message}
                  </code>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Troubleshooting Steps:</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Ensure you have a stable internet connection</li>
                  <li>Try using a different browser</li>
                  <li>Check if your files are in supported formats</li>
                </ol>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="default"
                  className="flex-1 min-w-[120px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleDownloadErrorReport}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Error Report
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  If the problem persists, please download the error report 
                  and contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle async errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error("Async Error:", error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    handleError,
    resetError
  }
}

// Async error wrapper component
export function AsyncErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}) {
  const [error, setError] = React.useState<Error | null>(null)

  const retry = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason)
      if (event.reason instanceof Error) {
        setError(event.reason)
      } else {
        setError(new Error(String(event.reason)))
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (error) {
    if (fallback) {
      const FallbackComponent = fallback
      return <FallbackComponent error={error} retry={retry} />
    }
    
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>An error occurred: {error.message}</span>
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}