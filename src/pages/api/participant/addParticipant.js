import getGames from "@/pages/api/participant/getGames"
import prisma from "../../../../utils/prisma"

export default async function addParticipant(req, res) {
    try {
        let message = "added"

        let game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        if (game === null) {
            message = "no_game"
        } else if (game.status === "started" || game.status === "ended") {
            message = "bad_status"
        } else {
            const participant = await prisma.participant.findUnique({
                where: {
                    game_user: {game: game.id, user: req.body.user}
                },
            })

            if(participant === null) {
                await prisma.participant.create({
                    data: {
                        game: game.id,
                        user: req.body.user,
                        score: 0,
                        hasJoined: false,
                        hasPhotos: false,
                        createdAt: new Date()
                    }
                })
            } else {
                message = "already_added"
            }
        }

        res.status(200).json({content: {message: message, games: getGames(req, res)}})
    } catch (err) {
        res.status(500).json(err)
    }
}