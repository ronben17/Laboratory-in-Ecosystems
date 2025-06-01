"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Droplets, Sun, Thermometer, Wind, Scissors, Leaf, AlertTriangle, Check, Info, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type SensorData = {
  airHumidity: number
  soilMoisture: number
  temperature: number
}

type CareTip = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  priority: "high" | "medium" | "low"
  category: "watering" | "temperature" | "general"
}

export default function CareTips({ sensorData }: { sensorData: SensorData }) {
  const [careTips, setCareTips] = useState<CareTip[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")

  useEffect(() => {
    // Generate care tips based on sensor data
    const tips: CareTip[] = []

    // Watering tips based on soil moisture
    if (sensorData.soilMoisture < 30) {
      tips.push({
        id: "water-low",
        title: "Water your basil plant",
        description: "Soil moisture is low. Water thoroughly until moisture reaches 40-60%.",
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        priority: "high",
        category: "watering",
      })
    } else if (sensorData.soilMoisture > 75) {
      tips.push({
        id: "water-high",
        title: "Reduce watering",
        description: "Soil is too wet. Allow to dry out slightly before watering again.",
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        priority: "medium",
        category: "watering",
      })
    } else {
      tips.push({
        id: "water-good",
        title: "Watering is optimal",
        description: "Current soil moisture is ideal for basil. Maintain this level.",
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        priority: "low",
        category: "watering",
      })
    }

    // Temperature tips
    if (sensorData.temperature < 18) {
      tips.push({
        id: "temp-low",
        title: "Increase temperature",
        description: "Environment is too cool for basil. Ideal temperature is 20-25°C.",
        icon: <Thermometer className="h-5 w-5 text-red-500" />,
        priority: "high",
        category: "temperature",
      })
    } else if (sensorData.temperature > 28) {
      tips.push({
        id: "temp-high",
        title: "Reduce temperature",
        description: "Environment is too warm. Move to a cooler location or improve air circulation.",
        icon: <Thermometer className="h-5 w-5 text-red-500" />,
        priority: "high",
        category: "temperature",
      })
    } else {
      tips.push({
        id: "temp-good",
        title: "Temperature is optimal",
        description: "Current temperature is ideal for basil growth.",
        icon: <Thermometer className="h-5 w-5 text-red-500" />,
        priority: "low",
        category: "temperature",
      })
    }

    // Humidity tips
    if (sensorData.airHumidity < 40) {
      tips.push({
        id: "humidity-low",
        title: "Increase humidity",
        description: "Air is too dry. Mist leaves or use a humidity tray.",
        icon: <Wind className="h-5 w-5 text-blue-400" />,
        priority: "medium",
        category: "general",
      })
    }

    // General care tips
    tips.push({
      id: "prune-tip",
      title: "Prune regularly",
      description: "Pinch off flower buds and top leaves to encourage bushier growth.",
      icon: <Scissors className="h-5 w-5 text-gray-500" />,
      priority: "low",
      category: "general",
    })

    tips.push({
      id: "harvest-tip",
      title: "Harvest correctly",
      description: "Harvest from the top down, taking whole stems rather than individual leaves.",
      icon: <Leaf className="h-5 w-5 text-green-500" />,
      priority: "low",
      category: "general",
    })

    // Add a general tip about light since we don't have a sensor
    tips.push({
      id: "light-general",
      title: "Ensure adequate light",
      description: "Basil plants need 6-8 hours of sunlight daily. Place near a south-facing window for best results.",
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      priority: "medium",
      category: "general",
    })

    setCareTips(tips)
  }, [sensorData])

  const filteredTips = activeCategory === "all" ? careTips : careTips.filter((tip) => tip.category === activeCategory)

  const highPriorityTips = filteredTips.filter((tip) => tip.priority === "high")
  const otherTips = filteredTips.filter((tip) => tip.priority !== "high")

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200"
      case "medium":
        return "bg-amber-50 border-amber-200"
      case "low":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "medium":
        return <Info className="h-5 w-5 text-amber-500" />
      case "low":
        return <Check className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Care Recommendations
        </CardTitle>
        <CardDescription className="text-green-100">
          Personalized tips based on your basil plant's current conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-6 grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white">
              All Tips
            </TabsTrigger>
            <TabsTrigger value="watering" className="rounded-md data-[state=active]:bg-white">
              <Droplets className="mr-2 h-4 w-4" />
              Watering
            </TabsTrigger>
            <TabsTrigger value="temperature" className="rounded-md data-[state=active]:bg-white">
              <Thermometer className="mr-2 h-4 w-4" />
              Temperature
            </TabsTrigger>
            <TabsTrigger value="general" className="rounded-md data-[state=active]:bg-white">
              <Leaf className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {highPriorityTips.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 font-medium text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Attention Required
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {highPriorityTips.map((tip) => (
                    <div
                      key={tip.id}
                      className={cn("flex gap-4 rounded-lg border p-4", getPriorityStyles(tip.priority))}
                    >
                      <div className="mt-1 rounded-full bg-white p-2">{tip.icon}</div>
                      <div>
                        <h4 className="font-medium">{tip.title}</h4>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-700">
                <Leaf className="h-5 w-5 text-green-500" />
                Care Tips
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherTips.map((tip) => (
                  <div key={tip.id} className={cn("flex gap-4 rounded-lg border p-4", getPriorityStyles(tip.priority))}>
                    <div className="mt-1 rounded-full bg-white p-2">{tip.icon}</div>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <h4 className="font-medium">{tip.title}</h4>
                        {getPriorityIcon(tip.priority)}
                      </div>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredTips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Leaf className="mb-2 h-12 w-12 text-gray-300" />
                <p>No care tips available for this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 rounded-lg bg-green-50 p-4">
          <h3 className="mb-2 font-medium">Did you know?</h3>
          <p className="text-sm text-gray-600">
            Basil plants prefer 6-8 hours of sunlight daily and consistent watering to keep soil moist but not soggy.
            Regular harvesting encourages bushier growth and more leaves.
          </p>
          <Button variant="link" className="mt-1 h-auto p-0 text-green-600">
            Learn more about basil care
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
