import React from 'react'

interface TabContentProps {
  tabId: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

/**
 * Animated tab content wrapper
 * Provides smooth transitions between tabs
 */
export function TabContent({ tabId, activeTab, children, className = "" }: TabContentProps) {
  const isActive = activeTab === tabId

  return (
    <div className={`${isActive ? "block" : "hidden"} ${className}`}>
      {children}
    </div>
  )
}