import {io} from "socket.io-client"
import prisma from "../../../../lib/prisma"

const socket = io.connect("http://192.168.1.12:4000")

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

        if(responsesCount === participantsCount) {
            if (req.body.lastPhoto) {
                socket.emit("getSolution")
            } else {
                socket.emit("changePhoto")
            }
        }

        res.status(200).json({content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}