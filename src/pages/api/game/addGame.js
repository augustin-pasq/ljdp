import prisma from "../../../../utils/prisma"
import {randomBytes} from "node:crypto"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(addGame)

async function addGame(req, res) {
    try {
        let existingAccessCodes = await prisma.game.findMany({
            select: {
                accessCode: true,
            }
        })

        let accessCode = randomBytes(2).toString("hex").toUpperCase()
        while(existingAccessCodes.find(obj => obj.accessCode === accessCode) !== undefined) accessCode = randomBytes(2).toString("hex").toUpperCase()

        const response = await prisma.game.create({
            data: {
                accessCode: accessCode,
                owner: req.session.user.id,
                status: "created"
            }
        })

        await prisma.participant.create({
            data: {
                game: response.id,
                user: req.session.user.id,
                score: 0,
                hasJoined: false,
                hasPhotos: false,
                createdAt: new Date()
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}