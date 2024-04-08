import prisma from "../../../../lib/prisma"

export default async function createCategory(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const response = await prisma.category.create({
            data: {
                title: req.body.title,
                game: game.id,
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}