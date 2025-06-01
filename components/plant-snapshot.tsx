"use client"

import { useState } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Camera, Clock, Leaf, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function PlantSnapshot() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [snapshots] = useState([
    {
      id: 1,
      date: "Today",
      time: "10:30 AM",
      imageUrl: "/placeholder.svg?height=400&width=600",
      health: "Excellent",
      healthScore: 95,
      notes: "Leaves are vibrant green and full. Plant is growing well.",
    },
    {
      id: 2,
      date: "Yesterday",
      time: "11:45 AM",
      imageUrl: "/placeholder.svg?height=400&width=600",
      health: "Good",
      healthScore: 85,
      notes: "Some new growth visible. Overall looking healthy.",
    },
    {
      id: 3,
      date: "May 15, 2025",
      time: "09:15 AM",
      imageUrl: "/placeholder.svg?height=400&width=600",
      health: "Good",
      healthScore: 80,
      notes: "Slight yellowing on lower leaves. May need more nutrients.",
    },
  ])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % snapshots.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + snapshots.length) % snapshots.length)
  }

  const currentSnapshot = snapshots[currentIndex]

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excellent":
        return "text-green-600"
      case "Good":
        return "text-green-500"
      case "Fair":
        return "text-amber-500"
      case "Poor":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-r from-green-100 to-green-50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-green-200 p-2">
            <Camera className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-800">Plant Snapshots</h2>
            <p className="text-green-700">Visual history of your basil plant's growth</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" />
            Take New Snapshot
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={currentSnapshot.imageUrl || "/placeholder.svg"}
            alt={`Plant snapshot from ${currentSnapshot.date}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl font-bold">Basil Plant</h3>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {currentSnapshot.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentSnapshot.time}
              </div>
              <div className="flex items-center gap-1">
                <Leaf className="h-4 w-4" />
                Health: <span className={getHealthColor(currentSnapshot.health)}>{currentSnapshot.health}</span>
              </div>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/80 p-1.5 backdrop-blur-sm hover:bg-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <div className="aspect-video w-full overflow-hidden rounded-md">
                <img
                  src={currentSnapshot.imageUrl || "/placeholder.svg"}
                  alt={`Plant snapshot from ${currentSnapshot.date}`}
                  className="h-full w-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium">Plant Health Analysis</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Health Score:</span>
              <div className="flex items-center gap-1">
                <div className="h-2 w-16 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${currentSnapshot.healthScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{currentSnapshot.healthScore}%</span>
              </div>
            </div>
          </div>

          <p className="mb-6 text-gray-600">{currentSnapshot.notes}</p>

          <div className="flex justify-center">
            <div className="flex gap-2">
              {snapshots.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-8 rounded-full ${index === currentIndex ? "bg-green-500" : "bg-gray-200"}`}
                  onClick={() => setCurrentIndex(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {snapshots.map((snapshot) => (
          <Card
            key={snapshot.id}
            className={`cursor-pointer overflow-hidden border-2 transition-all hover:shadow-md ${
              snapshot.id === currentSnapshot.id ? "border-green-500" : "border-transparent"
            }`}
            onClick={() => setCurrentIndex(snapshots.findIndex((s) => s.id === snapshot.id))}
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={snapshot.imageUrl || "/placeholder.svg"}
                alt={`Plant snapshot from ${snapshot.date}`}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Basil Plant</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {snapshot.date}
                <Clock className="ml-2 h-3.5 w-3.5" />
                {snapshot.time}
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm">Health:</span>
                <span className={`text-sm font-medium ${getHealthColor(snapshot.health)}`}>{snapshot.health}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
