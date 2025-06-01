import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await axios.get("http://34.165.58.92:5000/graph")
        res.status(200).json(response.data)
    } catch (error: any) {
        console.error("Proxy error:", error.message)
        res.status(500).json({ error: "Failed to fetch from Flask server" })
    }
}
