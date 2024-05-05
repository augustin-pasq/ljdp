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
        } else if (req.body.target === "/edit" && response.owner !== req.body.user.id) {
            message = "unauthorized"
        } else if (req.body.target === "/play" && response.status === "created") {
            message = "not_started_yet"
        } else if (req.body.target === "/play" && response.status === "started") {
            const participant = await prisma.participant.findUnique({
                where: {
                    game_user: {game: response.id, user: req.body.user.id}
                }
            })

            if (participant === null) {
                message = "not_joined"
            } else {
                success = true
            }
        } else if (req.body.target !== "/play" && response.status === "started") {
            message = "started"
        } else if (req.body.target !== "/scores" && response.status === "ended") {
            message = "ended"
        } else {
            success = true
        }

        res.status(200).json({success: success, message: message, content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}