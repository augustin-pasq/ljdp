import prisma from "../../../../lib/prisma"

export default async function setHasJoined(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const participant =  await prisma.participant.findUnique({
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
                    hasPhotos: false
                }
            })
        } else {
            await prisma.participant.update({
                where: {
                    game_user: {game: game.id, user: req.body.user}
                },
                data: {
                    hasJoined: true
                }
            })
        }

        const user = await prisma.user.findUnique({
            select: {
                id: true,
                username: true,
                displayedName: true,
                profilePicture: true
            },
            where: {
                id: req.body.user
            }
        })

        res.status(200).json({content: {user: user, game: game}})
    } catch (err) {
        res.status(500).json(err)
    }
}