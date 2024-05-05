import prisma from "../../../../lib/prisma"

export default async function addResponse(req, res) {

    try {
        await prisma.response.create({
            data: {
                user: req.body.user,
                photo: req.body.photo,
                value: req.body.response
            }
        })

        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        const solution = await prisma.photo.findUnique({
            where: {
                id: req.body.photo,
                user: req.body.response
            }
        })

        const participant = await prisma.participant.findUnique({
            where: {
                game_user: {game: game.id, user: req.body.user}
            }
        })

        if(solution !== null) {
            await prisma.participant.update({
                where: {
                    game_user: {game: game.id, user: req.body.user}
                },
                data: {
                    score: participant.score + 1
                }
            })
        }

        const participantsCount = await prisma.participant.count({
            where: {
                game: game.id,
                hasJoined: true
            }
        })

        const responsesCount = await prisma.response.count({
            where: {
                photo: req.body.photo
            }
        })

        res.status(200).json({content: {participantsCount: participantsCount, responsesCount: responsesCount}})
    } catch (err) {
        res.status(500).json(err)
    }
}