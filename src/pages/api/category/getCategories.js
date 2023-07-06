import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        let game = await prisma.game.findFirst({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const results = await prisma.category.findMany({
            select: {
                id: true,
                title: true,
                type: true
            },
            where: {
                game: game.id
            }
        })

        res.status(200).json(results)
    } catch (e) {
        res.status(500).json(e)
    }
}