"use client"

import React from 'react'
import { Shield, Zap, Download, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  children: React.ReactNode
}

/**
 * Client component for hero section with navigation interactivity
 * Contains scroll behavior and navigation
 */
export function HeroSection({ children }: HeroSectionProps) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/50" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30" />
      
      <div className="relative">
        {/* Header */}
        <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SubtitleBurner</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              FAQ
            </button>
            <button 
              onClick={() => scrollToSection('opensource')}
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Open Source
            </button>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
          <div className="text-center mb-16">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Professional Subtitle
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  {" "}Burning
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Burn subtitles into your videos with professional-grade quality. 
                100% client-side processing, no uploads, complete privacy.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% Offline</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>Lightning Fast</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Free Forever</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main App Section */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}