import prisma from "../../../../lib/prisma"

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

        res.status(200).json({content: response})
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}