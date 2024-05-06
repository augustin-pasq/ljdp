import formidable from "formidable"
import fs from "fs"
import prisma from "../../../../lib/prisma"
import sharp from "sharp"
import {v4 as uuidv4} from "uuid"

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function addPhoto(req, res) {
    let response = {link: ""}

    try {
        const form = formidable({ uploadDir: "./public/uploads", keepExtensions: true, maxFileSize: 50 * 1024 * 1024 })

        await new Promise(resolve => {
            form.parse(req, async (err, fields, files) => {
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

                let filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.webp`
                fs.rename(files.file[0].filepath, `./public/${filePath}`, async () => {
                    await sharp(fs.readFileSync(`./public/${filePath}`))
                        .toFormat("webp")
                        .resize({width: 960})
                        .webp({quality: 85})
                        .rotate()
                        .toFile(`./public/${filePath}`)
                })

                await prisma.photo.create({
                    data: {
                        link: filePath, category: category, user: user
                    }
                })

                response.link = filePath
                resolve()
            })
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}