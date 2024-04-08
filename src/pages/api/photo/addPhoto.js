import formidable from "formidable"
import {v4 as uuidv4} from "uuid"
import fs from "fs"
import prisma from "../../../../lib/prisma"

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function addPhoto(req, res) {
    let response = {link: ""}

    try {
        const form = formidable({ uploadDir: "./public/uploads", keepExtensions: true, maxFileSize: 50 * 1024 * 1024 })

        await new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    throw err
                } else if (files.file.length > 0) {
                    let filePath = ""
                    const category = parseInt(fields.category[0])
                    const user = parseInt(fields.user[0])

                    const game = await prisma.game.findUnique({
                        where: {
                            accessCode: fields.accessCode[0],
                        }
                    })

                    const participant = await prisma.participant.findFirst({
                        where: {
                            game: game.id, user: user
                        }
                    })

                    if (participant === null) {
                        await prisma.participant.create({
                            data: {
                                game: game.id, user: user, score: 0, hasJoined: false, hasPhotos: true
                            }
                        })
                    }

                    for (const file of files.file) {
                        filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.${file.originalFilename.split(".").pop()}`
                        fs.rename(file.filepath, `./public/${filePath}`, err => err)

                        await prisma.photo.create({
                            data: {
                                link: filePath, category: category, user: user
                            }
                        })
                    }

                    response.link = filePath
                    resolve()
                }
            })
        })

        return res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}