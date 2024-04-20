import prisma from "../../../../lib/prisma"

export default async function getPhotos(req, res) {
    try {
        const response = await prisma.photo.findMany({
            select: {
                link: true,
                User: {
                    select: {
                        username: true,
                        profilePicture: true
                    }
                }
            },
            where: {
                category: req.body.category
            }
        })

        res.status(200).json({content: response ?? {}})
    } catch (err) {
        res.status(500).json(err)
    }
}