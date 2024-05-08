import prisma from "../../../../utils/prisma"

export default async function getScores(req, res) {
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
                score: true
            },
            where: {
                game: game.id,
                hasJoined: true
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