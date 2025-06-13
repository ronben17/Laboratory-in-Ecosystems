"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Leaf,
    Camera,
    Upload,
    RefreshCw,
    Thermometer,
    Droplets,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"

export default function GrowthSimulation() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [analysisData, setAnalysisData] = useState<any | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageSource, setImageSource] = useState<"upload" | "capture" | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1800)
        return () => clearTimeout(timer)
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    setSelectedImage(event.target.result as string)
                    setImageSource("upload")
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const simulateCapture = async () => {
        try {
            const response = await axios.get("/api/fetch-pi-photo", {
                responseType: "blob",
            })
            const blob = response.data
            const imageUrl = URL.createObjectURL(blob)
            setSelectedImage(imageUrl)
            setImageSource("capture")
        } catch (error) {
            console.error("Error capturing image via proxy:", error)
        }
    }

    const analyzeGrowth = async () => {
        if (!selectedImage || !imageSource) return
        setIsAnalyzing(true)
        setIsError(false)

        try {
            const endpoint =
                imageSource === "upload" ? "/api/proxy-submit" : "/api/capture-submit"
            let response

            if (endpoint === "/api/proxy-submit") {
                const blob = await fetch(selectedImage).then((res) => res.blob())
                const formData = new FormData()
                formData.append("image", blob, "plant.jpg")
                response = await axios.post(endpoint, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            } else {
                response = await axios.get(endpoint)
            }

            const data = response.data

            if (
                !data["Current Status Summary"] ||
                !data["Health Score"] ||
                !data["Sensor Analysis"]
            ) {
                throw new Error("Invalid data format")
            }

            setAnalysisData(data)
        } catch (error) {
            console.error("Error during analysis:", error)
            setIsError(true)
            setAnalysisData(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="mb-4 animate-spin rounded-full border-4 border-green-400 border-t-transparent h-12 w-12 mx-auto"></div>
                    <p className="text-lg">Loading growth simulator...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="rounded-xl bg-gradient-to-r from-green-100 to-green-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-green-200 p-2">
                        <Leaf className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-green-800">Growth Simulation</h2>
                        <p className="text-green-700">Predict your basil plant's growth based on current conditions</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Image Upload */}
                <Card className="overflow-hidden border-none shadow-md">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" /> Plant Image
                        </CardTitle>
                        <CardDescription className="text-green-100">
                            Upload or capture a current image of your plant
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <div className={cn(
                            "flex h-64 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50",
                            selectedImage ? "p-2" : "p-6"
                        )}>
                            {selectedImage ? (
                                <img src={selectedImage || "/placeholder.svg"} alt="Selected plant" className="h-full w-full object-contain" />
                            ) : (
                                <div className="text-center">
                                    <Leaf className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">No image selected</p>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                                <Upload className="mr-2 h-4 w-4" /> Upload Image
                            </Button>
                            <Button variant="outline" onClick={simulateCapture} className="flex-1">
                                <Camera className="mr-2 h-4 w-4" /> Capture Image
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 p-6">
                        <Button className="w-full bg-green-600 hover:bg-green-700" disabled={!selectedImage || isAnalyzing} onClick={analyzeGrowth}>
                            {isAnalyzing ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                </>
                            ) : (
                                "Analyze Image"
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Result Panel */}
                <Card className="overflow-hidden border-none shadow-md">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5" /> Growth Analysis
                        </CardTitle>
                        <CardDescription className="text-green-100">
                            Predicted growth based on current plant state
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                                <div className="relative mx-auto h-24 w-24">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-75"></div>
                                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-green-500">
                                        <RefreshCw className="h-12 w-12 animate-spin text-white" />
                                    </div>
                                </div>
                                <p className="text-lg font-medium">Analyzing plant image...</p>
                            </div>
                        ) : isError ? (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-red-600">
                                <div className="rounded-full bg-red-100 p-6">
                                    <Upload className="h-10 w-10 text-red-500" />
                                </div>
                                <p className="mt-4 text-lg font-semibold">Analysis failed</p>
                                <p className="text-sm text-red-500 mt-1">The image format may be incorrect or the data is incomplete.</p>
                                <p className="text-sm text-red-500">Please upload a new, clear photo of your plant and try again.</p>
                            </div>
                        ) : analysisData ? (
                            <Tabs defaultValue="pro">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="pro">🌱 Tips & Pro Analysis</TabsTrigger>
                                    <TabsTrigger value="sensor">📊 Sensor Analysis</TabsTrigger>
                                </TabsList>

                                <TabsContent value="pro" className="space-y-4">
                                    <div className="rounded-xl bg-white shadow p-4 border border-green-200">
                                        <h4 className="text-green-700 font-bold">🌿 Current Status</h4>
                                        <p className="text-sm text-gray-700">{analysisData["Current Status Summary"]}</p>
                                    </div>
                                    <div className="rounded-xl bg-white shadow p-4 border border-green-200">
                                        <h4 className="text-green-700 font-bold">🧑‍🔬 Expert Observation</h4>
                                        <p className="text-sm text-gray-700">{analysisData["Expert Observation"]}</p>
                                    </div>
                                    <div className="rounded-xl bg-white shadow p-4 border border-green-200">
                                        <h4 className="text-green-700 font-bold">🏆 Health Score: {analysisData["Health Score"].score}/10</h4>
                                        <p className="text-sm text-gray-700">{analysisData["Health Score"].summary}</p>
                                    </div>
                                    <div className="rounded-xl bg-white shadow p-4 border border-green-200">
                                        <h4 className="text-green-700 font-bold">💡 Recommendation</h4>
                                        <p className="text-sm text-gray-700">{analysisData["Recommendation"]}</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="sensor" className="space-y-4">
                                    {Object.entries(analysisData["Sensor Analysis"]).map(([key, val]) => {
                                        const extractValue = parseFloat(val.interpretation.match(/\d+(\.\d+)?/g)?.[0] || "0")
                                        let percentage = 0
                                        if (key.toLowerCase().includes("temperature")) {
                                            percentage = extractValue < 20 ? 30 : extractValue > 32 ? 50 : 80
                                        } else if (key.toLowerCase().includes("humidity")) {
                                            percentage = extractValue < 40 ? 40 : extractValue > 70 ? 60 : 80
                                        } else if (key.toLowerCase().includes("moisture")) {
                                            percentage = extractValue < 30 ? 40 : extractValue > 60 ? 50 : 80
                                        } else {
                                            percentage = val.status === "within range" ? 80 : val.status === "high" ? 60 : 40
                                        }

                                        const statusColor = val.status === "within range" ? "text-green-600" : val.status === "high" ? "text-yellow-500" : "text-red-500"
                                        const progressColor = val.status === "within range" ? "bg-green-600" : val.status === "high" ? "bg-yellow-400" : "bg-red-500"

                                        return (
                                            <div key={key} className="mb-6">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {key.toLowerCase().includes("temp") ? (
                                                            <Thermometer className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <Droplets className="h-4 w-4 text-blue-500" />
                                                        )}
                                                        <span className="font-medium text-gray-800">{key}</span>
                                                    </div>
                                                    <span className={`text-sm font-medium ${statusColor}`}>{val.status.charAt(0).toUpperCase() + val.status.slice(1)}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-700 italic">{val.interpretation}</p>
                                                <p className="text-sm text-gray-600">💡 {val.tip}</p>
                                            </div>
                                        )
                                    })}
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-gray-500">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <Leaf className="h-12 w-12 text-gray-300" />
                                </div>
                                <p className="mt-4 text-lg">Upload and analyze a plant image to see growth predictions</p>
                                <p className="mt-2 text-sm text-gray-400">Our AI will analyze your plant and provide detailed growth forecasts</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
