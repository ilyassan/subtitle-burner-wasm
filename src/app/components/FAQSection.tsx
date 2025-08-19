import React from 'react'
import { FAQItem } from './FAQItem'

/**
 * Server component for FAQ section
 * Contains static structure with interactive FAQ items
 */
export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-xl text-gray-600">
            Everything you need to know about SubtitleBurner
          </p>
        </div>

        <div className="space-y-4">
          <FAQItem
            question="Can I close the browser while processing?"
            answer="No, the processing happens entirely in your browser using WebAssembly. If you close the browser tab, the processing will stop. However, you can minimize the window and continue using other applications while processing continues."
          />
          <FAQItem
            question="Is my video data secure and private?"
            answer="Absolutely! Your videos never leave your device. All processing happens locally in your browser using WebAssembly technology. No uploads, no server processing, complete privacy guaranteed."
          />
          <FAQItem
            question="What video and subtitle formats are supported?"
            answer="We support most common video formats (MP4, WebM, etc.) and subtitle formats including SRT, VTT, ASS, and SSA. The tool automatically detects and processes your files accordingly."
          />
          <FAQItem
            question="How long does processing typically take?"
            answer="Processing time depends on your video length, quality settings, and device performance. Our smart optimization automatically filters irrelevant subtitles to reduce processing time. Most videos process in 2-5 minutes."
          />
          <FAQItem
            question="Can I process multiple videos at once?"
            answer="Yes! We support batch processing where you can upload multiple subtitle files with one video, or process multiple videos sequentially. This is perfect for content creators with multiple language versions."
          />
          <FAQItem
            question="Do I need to install anything?"
            answer="No installation required! SubtitleBurner runs entirely in your web browser. Just visit the website and start burning subtitles immediately. Works on any modern browser."
          />
        </div>
      </div>
    </section>
  )
}