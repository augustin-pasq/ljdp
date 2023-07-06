import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        let game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const results = await prisma.category.create({
            data: {
                title: req.body.title,
                type: req.body.type,
                game: game.id,
            }
        })

        res.status(200).json(results)
    } catch (e) {
        res.status(500).json(e)
    }
}