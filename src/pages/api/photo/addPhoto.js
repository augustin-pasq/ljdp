import formidable from "formidable"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import prisma from "../../../../lib/prisma"

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function handle(req, res) {
    try {
        const form = formidable({ uploadDir: "./public/uploads", keepExtensions: true, maxFileSize: 50 * 1024 * 1024 })

        await form.parse(req, async (err, fields, files) => {
            if (err) throw err

            for (const file of files.file) {
                const filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.${file.originalFilename.split(".").pop()}`
                fs.rename(file.filepath, `./public/${filePath}`, err => err)

                await prisma.photo.create({
                    data: {
                        link: filePath,
                        category: parseInt(fields.category[0]),
                        user: parseInt(fields.user[0])
                    }
                })
            }

            return res.status(200).json({})
        })
    } catch (err) {
        res.status(500).json(err)
    }
}