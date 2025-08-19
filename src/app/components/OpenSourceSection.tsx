import React from 'react'
import { Github, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Server component for open source section
 * Static content with external links
 */
export function OpenSourceSection() {
  return (
    <section id="opensource" className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div>
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Github className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-4xl font-bold text-white mb-6">
            Open Source & Community Driven
          </h3>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            SubtitleBurner is completely open source, built with modern web technologies. 
            Contribute to the project, report issues, or customize it for your needs. 
            Transparency and community collaboration at its core.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://github.com/ilyassan/subtitle-burner-wasm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Apache 2.0 Licensed</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}