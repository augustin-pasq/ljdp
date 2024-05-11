import prisma from "../../../../utils/prisma"

export default async function countPhotos(req, res) {
    try {
        const response = await prisma.photo.count({
            where: {
                Category: {
                    game: req.body.game
                }
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}