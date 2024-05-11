import prisma from "../../../../utils/prisma"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(addResponse)

async function addResponse(req, res) {
    try {
        await prisma.response.create({
            data: {
                user: req.session.user.id,
                photo: req.body.photo,
                value: req.body.response
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
                game_user: {game: req.body.game, user: req.session.user.id}
            }
        })

        if(solution !== null) {
            await prisma.participant.update({
                where: {
                    game_user: {game: req.body.game, user: req.session.user.id}
                },
                data: {
                    score: participant.score + 1
                }
            })
        }

        const participantsCount = await prisma.participant.count({
            where: {
                game: req.body.game,
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
        console.log(err)
        res.status(500).json(err)
    }
}