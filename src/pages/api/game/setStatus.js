import prisma from "../../../../lib/prisma"

export default async function setStatus(req, res) {
    try {
        const game = await prisma.game.update({
            where: {
                accessCode: req.body.accessCode
            },
            data: {
                status: req.body.status
            }
        })

        res.status(200).json({content: game})
    } catch (err) {
        res.status(500).json(err)
    }
}