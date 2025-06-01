// pages/api/sensor.ts
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch("https://gardenpi.duckdns.org/")
        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        console.error("Error fetching sensor data:", error)
        res.status(500).json({ error: "Failed to fetch sensor data" })
    }
}
