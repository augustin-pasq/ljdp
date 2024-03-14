import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let accessCode = require("crypto").randomBytes(2).toString("hex").toUpperCase()
    let existingAccessCodes = {}

    try {
        existingAccessCodes = await prisma.game.findMany({
            select: {
                accessCode: true,
            }
        })

        while(existingAccessCodes.find(obj => obj.accessCode === accessCode) !== undefined) accessCode = require("crypto").randomBytes(2).toString("hex").toUpperCase()

        const response = await prisma.game.create({
            data: {
                accessCode: accessCode,
                owner: req.body.user.id,
                status: 1
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}