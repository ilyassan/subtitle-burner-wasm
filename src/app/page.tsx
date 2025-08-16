"use client"

import React from "react"

import { 
  Zap, 
  Shield, 
  Download, 
  Github, 
  Heart,
  ChevronDown,
  Sparkles,
  Cpu,
  Globe,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const VideoSubtitleBurner = dynamic(() => import("./VideoSubtitleBurner"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
})


const FeatureCard = ({ icon: Icon, title, description }: { 
  icon: React.ElementType, 
  title: string, 
  description: string 
}) => (
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

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <div
          
          
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </button>
      <div
        
        
        className="overflow-hidden"
      >
        <div className="px-6 pb-4 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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
              <div
                
                
                
              >
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
            <div
              
              
              
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <VideoSubtitleBurner />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div
            
            
            className="text-center mb-16"
          >
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

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div
            
            
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-xl text-gray-600">
              Everything you need to know about SubtitleBurner
            </p>
          </div>

          <div
            
            
            className="space-y-4"
          >
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

      {/* Open Source Section */}
      <section id="opensource" className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            
            
          >
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
                href="https://github.com/ilyassan/subtitle-burner-ffmpeg-wawasm"
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
                  <span>MIT Licensed</span>
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

      {/* Donation Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            
            
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Support the Project
            </h3>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              SubtitleBurner is free and always will be. If you find it useful, 
              consider supporting the development to help us add more features 
              and maintain the service.
            </p>
            <div
              
            >
              <form 
                action="https://www.paypal.com/donate" 
                method="post" 
                target="_blank"
                className="inline-block"
              >
                <input type="hidden" name="business" value="anidailyass@gmail.com" />
                <input type="hidden" name="currency_code" value="USD" />
                <Button 
                  type="submit"
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Donate via PayPal
                </Button>
              </form>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Your support helps keep this project free and actively maintained
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                href="https://github.com/ilyassan/subtitle-burner-ffmpeg-wawasm" 
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
    </div>
  )
}