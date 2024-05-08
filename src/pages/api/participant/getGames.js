import prisma from "../../../../lib/prisma"
import {withSessionRoute} from "../../../../lib/ironSession"

export default withSessionRoute(getGames)

async function getGames(req, res) {
    try {
        const response = await prisma.participant.findMany({
            select: {
                createdAt: true,
                Game: {
                    select: {
                        id: true,
                        accessCode: true,
                        status: true,
                        User: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            },
            where: {
                user: req.session.user.id
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}