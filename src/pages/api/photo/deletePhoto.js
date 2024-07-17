import fs from "fs"
import prisma from "../../../../utils/prisma"

export default async function deletePhoto(req, res) {
    try {
        const photo = await prisma.photo.findFirst({
            select: {
                id: true,
                link: true,
                Category: {
                    select: {
                        type: true
                    }
                }
            },
            where: {
                link: req.body.link,
            },
        })

        await prisma.photo.delete({
            where: {
                id: photo.id
            }
        })

        if (photo.Category.type !== 'youtube') {
            fs.unlinkSync(`./public/${photo.link}`)
        }

        res.status(200).json({content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}