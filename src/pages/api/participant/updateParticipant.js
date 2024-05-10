import prisma from "../../../../utils/prisma"

export default async function updateParticipant(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                id: req.body.game,
            }
        })

        await prisma.participant.update({
            data: {
                hasJoined: true
            },
            where: {
                game_user: {game: game.id, user: req.body.user},
            }
        })

        const result = await prisma.participant.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    }
                },
                hasJoined: true,
                hasPhotos: true
            },
            where: {
                game: game.id,
            },
            orderBy: {
                score: "desc"
            }
        })

        res.status(200).json({content: result})
    } catch (err) {
        res.status(500).json(err)
    }
}