import React from "react"

// Icons are now imported in individual components
import { HeroSection } from "./components/HeroSection"
import { FeaturesSection } from "./components/FeaturesSection"
import { FAQSection } from "./components/FAQSection"
import { OpenSourceSection } from "./components/OpenSourceSection"
import { Footer } from "./components/Footer"
import { AppWrapper } from "./components/AppWrapper"

/**
 * Main landing page with SEO-optimized server and client components
 * Server components handle static content for better SEO
 * Client components handle interactivity where needed
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection>
        <AppWrapper />
      </HeroSection>
      
      <FeaturesSection />
      <FAQSection />
      <OpenSourceSection />
      <Footer />
    </div>
  )
}