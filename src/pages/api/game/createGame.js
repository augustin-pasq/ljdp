import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let accessCode = require('crypto').randomBytes(2).toString('hex').toUpperCase()
    let existingAccessCodes = {}

    try {
        existingAccessCodes = await prisma.game.findMany({
            select: {
                accessCode: true,
            }
        })

        while(existingAccessCodes.find(obj => obj.accessCode === accessCode) !== undefined) accessCode = require('crypto').randomBytes(2).toString('hex').toUpperCase()

        const results = await prisma.game.create({
            data: {
                accessCode: accessCode,
                status: 'Créée',
                owner: req.body.user
            }
        })

        res.status(200).json(results)
    } catch (e) {
        res.status(500).json(e)
    }
}