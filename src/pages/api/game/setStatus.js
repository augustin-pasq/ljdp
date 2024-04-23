import prisma from "../../../../lib/prisma"

export default async function setStatus(req, res) {
    try {
        await prisma.game.update({
            where: {
                accessCode: req.body.accessCode
            },
            data: {
                status: req.body.status
            }
        })

        res.status(200).json({content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}