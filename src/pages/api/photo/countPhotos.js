import prisma from "../../../../utils/prisma"

export default async function countPhotos(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const response = await prisma.photo.count({
            where: {
                Category: {
                    game: game.id
                }
            }
        })

        res.status(200).json({content: {count: response, game: game}})
    } catch (err) {
        res.status(500).json(err)
    }
}