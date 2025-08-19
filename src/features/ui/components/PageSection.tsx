import React from 'react'

interface PageSectionProps {
  title: string
  description?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children: React.ReactNode
  className?: string
}

/**
 * Reusable page section component
 * Provides consistent section styling with animation
 */
export function PageSection({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = ""
}: PageSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}