import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        await prisma.game.update({
            where: {
                accessCode: req.body.accessCode,
            },
            data: {
                status: req.body.status
            }
        })

        res.status(200).json({})
    } catch (e) {
        res.status(500).json(e)
    }
}