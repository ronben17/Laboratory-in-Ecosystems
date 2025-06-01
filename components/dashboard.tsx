"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SensorDashboard from "@/components/sensor-dashboard"
import PlantSnapshot from "@/components/plant-snapshot"
import GrowthSimulation from "@/components/growth-simulation"
import { ThemeProvider } from "@/components/theme-provider"
import { Sprout } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <header className="border-b border-green-200 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1.5">
                  <Sprout className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-xl font-bold text-green-800">basil.com</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="relative mb-8 overflow-hidden bg-gradient-to-r from-green-600 to-green-400 py-12 text-white">
          <div className="container relative z-10 mx-auto px-4">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-2 text-3xl font-bold">Your Basil Plant Dashboard</h2>
                <p className="mb-4 text-green-50">
                  Monitor, analyze, and predict your basil plant's growth with real-time data and AI-powered insights.
                </p>
                <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-green-700">
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                  Plant Status: Healthy
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-48 w-48">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-white/20"></div>
                  <div className="absolute inset-2 rounded-full bg-white/30"></div>
                  <div className="absolute inset-4 rounded-full bg-white/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout className="h-24 w-24 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white"></div>
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white"></div>
            <div className="absolute bottom-12 right-12 h-16 w-16 rounded-full bg-white"></div>
            <div className="absolute left-1/4 top-1/3 h-24 w-24 rounded-full bg-white"></div>
          </div>
        </div>

        <main className="container mx-auto px-4 pb-12">
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex w-full max-w-md rounded-full bg-green-100 p-1">
              <TabsTrigger
                value="dashboard"
                className="flex-1 rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="snapshot"
                className="flex-1 rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Snapshot
              </TabsTrigger>
              <TabsTrigger
                value="growth"
                className="flex-1 rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Growth Simulation
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="space-y-4">
              <SensorDashboard />
            </TabsContent>
            <TabsContent value="snapshot" className="space-y-4">
              <PlantSnapshot />
            </TabsContent>
            <TabsContent value="growth" className="space-y-4">
              <GrowthSimulation />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}
