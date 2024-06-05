import fs from "fs"
import prisma from "../../../../utils/prisma"

export default async function deletePhoto(req, res) {
    try {
        const photo = await prisma.photo.findFirst({
            where: {
                link: req.body.link,
            },
        })

        await prisma.photo.delete({
            where: {
                id: photo.id
            }
        })

        fs.unlinkSync(`./public/${photo.link}`)

        res.status(200).json({content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}