"use client"

import React, { useState, useEffect } from "react"
import { Battery, BatteryLow, BatteryWarning, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

interface BatteryIndicatorProps {
  className?: string
}

interface BatteryManager {
  level: number
  charging: boolean
  addEventListener: (event: string, callback: () => void) => void
  removeEventListener: (event: string, callback: () => void) => void
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  className = ""
}) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState<boolean>(false)
  const [isSupported, setIsSupported] = useState<boolean>(false)

  useEffect(() => {
    // Check if Battery API is supported
    const nav = navigator as NavigatorWithBattery
    if (nav.getBattery) {
      setIsSupported(true)
      
      nav.getBattery().then((battery: BatteryManager) => {
        const updateBatteryInfo = () => {
          setBatteryLevel(Math.round(battery.level * 100))
          setIsCharging(battery.charging)
        }

        updateBatteryInfo()

        // Listen for battery events
        battery.addEventListener('chargingchange', updateBatteryInfo)
        battery.addEventListener('levelchange', updateBatteryInfo)

        // Cleanup function
        return () => {
          battery.removeEventListener('chargingchange', updateBatteryInfo)
          battery.removeEventListener('levelchange', updateBatteryInfo)
        }
      }).catch(() => {
        setIsSupported(false)
      })
    } else {
      setIsSupported(false)
    }
  }, [])

  if (!isSupported || batteryLevel === null) {
    return null
  }

  const getBatteryIcon = () => {
    if (isCharging) return Zap
    if (batteryLevel <= 20) return BatteryLow
    if (batteryLevel <= 50) return BatteryWarning
    return Battery
  }

  const getBatteryColor = () => {
    if (isCharging) return "text-green-500"
    if (batteryLevel <= 20) return "text-red-500"
    if (batteryLevel <= 50) return "text-yellow-500"
    return "text-primary"
  }

  const getBatteryFillColor = () => {
    if (isCharging) return "#10b981"
    if (batteryLevel <= 20) return "#ef4444"
    if (batteryLevel <= 50) return "#eab308"
    return "oklch(0.647 0.164 42.18)"
  }

  const BatteryIcon = getBatteryIcon()

  return (
    <div className={`fixed top-6 left-6 z-50 ${className}`}>
      <Card className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
        <div className="flex items-center gap-2 min-w-[80px]">
          {/* Battery icon with level indicator */}
          <div className="relative">
            <BatteryIcon className={`w-6 h-6 ${getBatteryColor()}`} />
            {isCharging && (
              <Zap className="absolute -top-1 -right-1 w-3 h-3 text-green-500 animate-pulse" />
            )}
          </div>
          
          {/* Battery level visualization */}
          <div className="flex-1 min-w-[30px]">
            <div className="flex items-center gap-1">
              <div className="relative w-8 h-3 bg-gray-200 rounded-sm border border-gray-300">
                {/* Battery level fill */}
                <div 
                  className="absolute left-0 top-0 h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${batteryLevel}%`,
                    backgroundColor: getBatteryFillColor()
                  }}
                />
                {/* Battery tip */}
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-1.5 bg-gray-300 rounded-r-sm" />
              </div>
              
              {/* Battery percentage */}
              <span className="text-xs font-medium text-gray-600 min-w-[25px]">
                {batteryLevel}%
              </span>
            </div>
            
            {/* Charging indicator text */}
            {isCharging && (
              <div className="text-[10px] text-green-600 font-medium mt-0.5">
                Charging
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}