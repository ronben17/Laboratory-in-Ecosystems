// pages/api/fetch-pi-photo.ts
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch("https://gardenpi.duckdns.org/photo")
        const blob = await response.arrayBuffer()
        res.setHeader("Content-Type", "image/jpeg")
        res.setHeader("Cache-Control", "no-store")
        res.status(200).send(Buffer.from(blob))
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch image from Pi" })
    }
}
