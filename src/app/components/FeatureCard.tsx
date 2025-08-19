import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
}

/**
 * Server component for displaying feature cards
 * Static content with no interactivity
 */
export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div>
      <Card className="h-full border-orange-100 hover:border-orange-200 transition-colors bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-600 text-center leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}