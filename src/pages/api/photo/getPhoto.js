import prisma from "../../../../lib/prisma"

export default async function getPhoto(req, res) {
    try {
        const response = await prisma.photo.findFirst({
            select: {
                link: true
            },
            where: {
                category: req.body.category,
                user: req.body.user
            }
        })

        res.status(200).json({content: response ?? {}})
    } catch (err) {
        res.status(500).json(err)
    }
}