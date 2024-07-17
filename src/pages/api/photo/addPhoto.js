import formidable from "formidable"
import fs from "fs"
import prisma from "../../../../utils/prisma"
import sharp from "sharp"
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
                switch(categoryType.type) {
                    case 'image':
                        filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.webp`
                        await fs.renameSync(files.file[0].filepath, `./public/${filePath}`)

                        await sharp(fs.readFileSync(`./public/${filePath}`))
                            .toFormat("webp")
                            .resize({width: 960})
                            .webp({quality: 85})
                            .rotate()
                            .toFile(`./public/${filePath}`)

                        break
                    case 'video':
                        filePath = `uploads/ljdp-uploaded_file-${uuidv4()}.mp4`
                        await fs.renameSync(files.file[0].filepath, `./public/${filePath}`)

                        break
                    case 'youtube':
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