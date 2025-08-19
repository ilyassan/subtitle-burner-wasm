import React from 'react'
import { Github, Sparkles } from 'lucide-react'

/**
 * Server component for footer
 * Static footer content
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">SubtitleBurner</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span>Built with ❤️ using Next.js & WebAssembly</span>
            <a 
              href="https://github.com/ilyassan/subtitle-burner-wasm" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}