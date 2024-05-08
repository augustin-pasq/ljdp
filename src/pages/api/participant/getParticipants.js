import prisma from "../../../../utils/prisma"

export default async function getParticipants(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const response = await prisma.participant.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    }
                },
                hasJoined: true
            },
            where: {
                game: game.id,
            },
            orderBy: {
                score: "desc"
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}