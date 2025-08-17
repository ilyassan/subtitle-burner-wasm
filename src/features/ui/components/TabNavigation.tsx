"use client"

import React from 'react'

interface Tab {
  id: string
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

/**
 * Reusable tab navigation component
 * Provides consistent tab styling and behavior
 */
export function TabNavigation({ tabs, activeTab, onTabChange, className = "" }: TabNavigationProps) {
  return (
    <div className={`flex justify-center mb-8 ${className}`} data-tabs>
      <div className="bg-secondary rounded-xl p-1 inline-flex" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            data-value={tab.id === 'quickstart' ? 'quick' : tab.id}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}