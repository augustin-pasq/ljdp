import formidable from "formidable"
import {v4 as uuidv4} from "uuid"
import fs from "fs"
import prisma from "../../../../lib/prisma"

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function handle(req, res) {
    let results = {link: ""}

    try {
        const form = formidable({ uploadDir: "./public/uploads", keepExtensions: true, maxFileSize: 50 * 1024 * 1024 })

        await form.parse(req, async (err, fields, files) => {
            if (err) throw err
            let filePath = ""
            const category = parseInt(fields.category[0])
            const user = parseInt(fields.user[0])
            const game = parseInt(fields.game[0])

            for (const file of files.file) {
                filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.${file.originalFilename.split(".").pop()}`
                fs.rename(file.filepath, `./public/${filePath}`, err => err)

                await prisma.photo.create({
                    data: {
                        link: filePath,
                        category: category,
                        user: user
                    }
                })

                const participant = await prisma.participant.findFirst({
                    where: {
                        game: game,
                        user: user
                    }
                })

                if (participant === null) {
                    await prisma.participant.create({
                        data: {
                            game: game,
                            user: user,
                            score: 0,
                            hasJoined: false,
                            hasPhotos: true
                        }
                    })
                }
            }

            results.link = filePath
        })

        return res.status(200).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}