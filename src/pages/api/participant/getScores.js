import prisma from "../../../../lib/prisma";

export default async function handle(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const results = await prisma.participant.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        displayedName: true,
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

        res.status(200).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}