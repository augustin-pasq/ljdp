import prisma from "../../../../lib/prisma"

export default async function getGame(req, res) {
    try {
        let response = await prisma.game.findFirst({
            where: {
                accessCode: req.body.code
            }
        })

        let success = false
        let message = ""

        if (response === null) {
            message = "not_found"
        } else if (req.body.target === "edit" && response.owner !== req.body.owner) {
            message = "unauthorized"
        } else if (response.status === 4) {
            message = "ended"
        } else {
            success = true
        }

        res.status(200).json({success: success, message: message, content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}