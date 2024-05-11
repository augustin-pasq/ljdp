import prisma from "../../../../utils/prisma"

export default async function setStatus(req, res) {
    try {
        await prisma.game.update({
            where: {
                id: req.body.game
            },
            data: {
                status: req.body.status
            }
        })

        res.status(200).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}