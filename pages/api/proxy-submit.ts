// pages/api/proxy-submit.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { IncomingForm } from "formidable"
import fs from "fs"
import axios from "axios"
import FormData from "form-data" // ← חשוב מאוד!

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const form = new IncomingForm()

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Form parsing error:", err)
            return res.status(500).json({ error: "Form parsing error" })
        }

        const file = Array.isArray(files.image) ? files.image[0] : files.image
        if (!file || !file.filepath) {
            return res.status(400).json({ error: "No file uploaded" })
        }

        const formData = new FormData()
        formData.append("image", fs.createReadStream(file.filepath), file.originalFilename || "image.jpg")

        try {
            const response = await axios.post("http://34.165.58.92:5000/submit2", formData, {
                headers: formData.getHeaders(),
            })

            res.status(200).json(response.data)
        } catch (error: any) {
            console.error("Error forwarding image:", error.message)
            res.status(500).json({ error: "Failed to forward image" })
        }
    })
}
