"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, Bar, BarChart, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Droplets, Thermometer, Wind, Leaf,
  Info, Sparkles, CheckCircle
} from "lucide-react"
import axios from "axios"

export default function SensorDashboard() {
  const [airHumidityHistory, setAirHumidityHistory] = useState<{ time: string; value: number }[]>([])
  const [soilMoistureHistory, setSoilMoistureHistory] = useState<{ time: string; value: number }[]>([])
  const [temperatureHistory, setTemperatureHistory] = useState<{ time: string; value: number }[]>([])

  const [airHumidity, setAirHumidity] = useState<number | null>(null)
  const [soilMoisture, setSoilMoisture] = useState<number | null>(null)
  const [temperature, setTemperature] = useState<number | null>(null)

  const [tipTemperature, setTipTemperature] = useState("")
  const [tipHumidity, setTipHumidity] = useState("")
  const [tipSoil, setTipSoil] = useState("")

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await axios.get("/api/graphApi")
        const data = res.data

        if (!Array.isArray(data)) throw new Error("Expected array from API")

        const parsedHumidity = data.map(entry => ({
          time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: entry.humidity?.value ?? 0,
        }))

        const parsedSoil = data.map(entry => ({
          time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: entry.soil?.percent ?? 0,
        }))

        const parsedTemp = data.map(entry => ({
          time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: entry.temperature?.value ?? 0,
        }))

        const last = data[0]
        console.log("Last sensor data:", last)
        setAirHumidity(last.humidity?.value ?? null)
        setSoilMoisture(last.soil?.percent ?? null)
        setTemperature(last.temperature?.value ?? null)

        // טיפים מתוך ניתוח סנסורים
        setTipTemperature(last["Sensor Analysis"]?.["Air Temperature"]?.tip ?? "")
        setTipHumidity(last["Sensor Analysis"]?.["Relative Humidity"]?.tip ?? "")
        setTipSoil(last["Sensor Analysis"]?.["Soil Moisture"]?.tip ?? "")

        setAirHumidityHistory(parsedHumidity)
        setSoilMoistureHistory(parsedSoil)
        setTemperatureHistory(parsedTemp)
      } catch (error) {
        console.error("Error fetching sensor data:", error)
      }
    }

    fetchGraphData()
    const interval = setInterval(fetchGraphData, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIndicator = (value: number | null, thresholds: { low: number; high: number }) => {
    if (value === null) return "bg-gray-300"
    if (value < thresholds.low || value > thresholds.high) return "bg-amber-500"
    return "bg-green-500"
  }

  const renderTipCard = (title: string, icon: JSX.Element, tip: string, color: string) => (
      <Card className={`relative overflow-hidden border-0 shadow-md rounded-xl bg-${color}-50`}>
        <div className={`absolute right-0 top-0 h-full w-2 bg-${color}-400`} />
        <CardHeader className={`flex items-center gap-4 bg-${color}-100 py-4 px-5`}>
          <div className={`rounded-full p-3 bg-${color}-200 shadow-inner`}>
            {icon}
          </div>
          <div>
            <CardTitle className={`text-${color}-800 text-xl font-bold tracking-wide flex items-center gap-2`}>
              {title} Tip
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </CardTitle>
            <div className="text-xs text-gray-600 mt-1 bg-white px-2 py-1 rounded-full inline-block shadow-sm">
              Based on sensor analysis
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-5 pt-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
            <div className="text-gray-800 text-base leading-relaxed font-medium space-y-3">
              {tip
                  .split("\n")
                  .filter(line => line.trim() !== "")
                  .map((line, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                        <span>{line}</span>
                      </p>
                  ))}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-green-700 font-semibold">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Tip is currently active
          </div>
        </CardContent>
      </Card>
  )

  return (
      <div className="space-y-12">
        <div className="rounded-xl bg-gradient-to-r from-green-100 to-green-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-green-200 p-2">
              <Leaf className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Live Sensor Data</h2>
              <p className="text-green-700">Real-time monitoring of your basil plant's environment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="rounded-full bg-blue-100 p-2">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Air Humidity</p>
                <p className="text-xl font-bold">{airHumidity}%</p>
              </div>
              <div className={`ml-auto h-2 w-2 rounded-full ${getStatusIndicator(airHumidity, { low: 45, high: 65 })}`}></div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="rounded-full bg-green-100 p-2">
                <Wind className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Soil Moisture</p>
                <p className="text-xl font-bold">{soilMoisture}%</p>
              </div>
              <div className={`ml-auto h-2 w-2 rounded-full ${getStatusIndicator(soilMoisture, { low: 40, high: 70 })}`}></div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
              <div className="rounded-full bg-red-100 p-2">
                <Thermometer className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="text-xl font-bold">{temperature}°C</p>
              </div>
              <div className={`ml-auto h-2 w-2 rounded-full ${getStatusIndicator(temperature, { low: 20, high: 26 })}`}></div>
            </div>
          </div>
        </div>

        {/* גרפים */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-500 to-blue-400 pb-2 text-white">
              <CardTitle className="text-sm font-medium">Air Humidity</CardTitle>
              <Droplets className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{airHumidity}%</div>
              <div className="h-[180px] mt-4">
                <ChartContainer config={{ humidity: { label: "Humidity", color: "hsl(215, 100%, 60%)" } }}>
                  <AreaChart data={airHumidityHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumidity)" isAnimationActive={false} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-green-600 to-green-500 pb-2 text-white">
              <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
              <Wind className="h-4 w-4 text-green-100" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{soilMoisture}%</div>
              <div className="h-[180px] mt-4">
                <ChartContainer config={{ moisture: { label: "Moisture", color: "hsl(142, 76%, 36%)" } }}>
                  <BarChart data={soilMoistureHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#22c55e" radius={4} isAnimationActive={false} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-red-500 to-red-400 pb-2 text-white">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-red-100" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{temperature}°C</div>
              <div className="h-[180px] mt-4">
                <ChartContainer config={{ temperature: { label: "Temperature", color: "hsl(0, 91%, 71%)" } }}>
                  <LineChart data={temperatureHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* טיפים מופרדים לכל סנסור */}
        <div className="grid gap-4 md:grid-cols-3">
          {renderTipCard("Air Humidity", <Droplets className="h-5 w-5 text-blue-600" />, tipHumidity, "blue")}
          {renderTipCard("Soil Moisture", <Wind className="h-5 w-5 text-green-600" />, tipSoil, "green")}
          {renderTipCard("Temperature", <Thermometer className="h-5 w-5 text-red-500" />, tipTemperature, "red")}
        </div>
      </div>
  )
}
