import formidable from "formidable"
import fs from "fs"
import prisma from "../../../../utils/prisma"
import sharp from "sharp"
import {v4 as uuidv4} from "uuid"
import {withSessionRoute} from "../../../../utils/ironSession"

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

                const game = await prisma.game.findUnique({
                    where: {
                        id: parseInt(fields.game[0]),
                    }
                })

                const participant = await prisma.participant.findFirst({
                    where: {
                        game: game.id, user: req.session.user.id
                    }
                })

                if (participant === null) {
                    await prisma.participant.create({
                        data: {
                            game: game.id, user: req.session.user.id, score: 0, hasJoined: false, hasPhotos: true
                        }
                    })
                }

                let filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.webp`
                await fs.renameSync(files.file[0].filepath, `./public/${filePath}`)

                await sharp(fs.readFileSync(`./public/${filePath}`))
                    .toFormat("webp")
                    .resize({width: 960})
                    .webp({quality: 85})
                    .rotate()
                    .toFile(`./public/${filePath}`)

                await prisma.photo.create({
                    data: {
                        link: filePath, category: parseInt(fields.category[0]), user: req.session.user.id
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