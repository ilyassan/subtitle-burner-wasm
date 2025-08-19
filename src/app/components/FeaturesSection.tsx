import React from 'react'
import { Shield, Zap, Cpu, Globe } from 'lucide-react'
import { FeatureCard } from './FeatureCard'

/**
 * Server component for features section
 * Static content showcase
 */
export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Core Functionalities
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for professional subtitle burning, 
            powered by cutting-edge web technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={Shield}
            title="100% Offline Processing"
            description="Your videos never leave your device. Everything runs locally in your browser using WebAssembly technology."
          />
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Advanced processing strategies with automatic optimization. Smart filtering reduces processing time significantly."
          />
          <FeatureCard
            icon={Cpu}
            title="Professional Quality"
            description="Multiple output formats, custom fonts, advanced styling options, and batch processing capabilities."
          />
          <FeatureCard
            icon={Globe}
            title="Universal Compatibility"
            description="Supports SRT, VTT, ASS, and SSA subtitle formats. Works with all modern video formats."
          />
        </div>
      </div>
    </section>
  )
}