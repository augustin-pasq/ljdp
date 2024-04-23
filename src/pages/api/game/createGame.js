import prisma from "../../../../lib/prisma"
import {randomBytes} from "node:crypto"

export default async function createGame(req, res) {
    let accessCode = randomBytes(2).toString("hex").toUpperCase()
    let existingAccessCodes = {}

    try {
        existingAccessCodes = await prisma.game.findMany({
            select: {
                accessCode: true,
            }
        })

        while(existingAccessCodes.find(obj => obj.accessCode === accessCode) !== undefined) accessCode = randomBytes(2).toString("hex").toUpperCase()

        const response = await prisma.game.create({
            data: {
                accessCode: accessCode,
                owner: req.body.user.id,
                status: "created"
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}