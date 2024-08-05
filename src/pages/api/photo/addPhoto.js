import formidable from "formidable"
import fs from "fs"
import gm from "gm"
import path from "path"
import prisma from "../../../../utils/prisma"
import {v4 as uuidv4} from "uuid"
import {withSessionRoute} from "../../../../utils/ironSession"
import {youtubeURLParser} from "../../../../utils/youtubeURLParser"

export const config = {
    api: {
        bodyParser: false
    }
}

export default withSessionRoute(addPhoto)

async function addPhoto(req, res) {
    try {
        const form = formidable({ uploadDir: "./public/uploads", keepExtensions: true, maxFileSize: 50 * 1024 * 1024 })

        const result = await new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) reject(err)

                await prisma.participant.update({
                    data: {
                        hasPhotos: true
                    },
                    where: {
                        game_user: {
                            game: parseInt(fields.game[0]),
                            user: req.session.user.id
                        }
                    }
                })

                const categoryType = await prisma.category.findUnique({
                    select: {
                        type: true
                    },
                    where: {
                        id: parseInt(fields.category[0])
                    }
                })

                let filePath = ''
                let originalFilePath = files?.file?.[0]?.filepath ?? null
                let extension = originalFilePath ? path.extname(originalFilePath) : null

                if (categoryType.type === 'image' && extension !== '.gif') {
                    filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.webp`
                    await fs.renameSync(originalFilePath, `./public/${filePath}`)
                    await processImage(`./public/${filePath}`)
                }
                else if (categoryType.type === 'video' || extension === '.gif') {
                    filePath = `uploads/ljdp-uploaded_file-${uuidv4()}${extension}`
                    await fs.renameSync(originalFilePath, `./public/${filePath}`)
                }
                else if (categoryType.type === 'youtube') {
                    const [id, startTime] = youtubeURLParser(fields.link[0])
                    filePath = `https://www.youtube.com/embed/${id}${startTime ? `?start=${startTime}` : ''}`
                }

                await prisma.photo.create({
                    data: {
                        link: filePath,
                        category: parseInt(fields.category[0]),
                        user: req.session.user.id
                    }
                })

                resolve(filePath)
            })
        })

        res.status(200).json({content: result})
    } catch (err) {
        res.status(500).json(err)
    }
}

async function processImage(path) {
    try {
        const format = await new Promise((resolve, reject) => {
            gm(path).format((err, format) => {
                if (err) return reject(err)
                resolve(format)
            })
        })

        const image = gm(path)

        if (format.toLowerCase() !== "heic") {
            image.autoOrient()
        }

        await new Promise((resolve, reject) => {
            image
                .resize(960)
                .setFormat("webp")
                .quality(85)
                .noProfile()
                .write(path, (err) => {
                    if (err) return reject(err)
                    resolve()
                })
        })
    } catch (error) {
        throw error
    }
}