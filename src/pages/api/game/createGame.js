import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let results = {"success" : undefined, content : []}
    let accessCode = require('crypto').randomBytes(2).toString('hex').toUpperCase()
    let existingAccessCodes = {}

    try {
        existingAccessCodes = await prisma.game.findMany({
            select: {
                accessCode: true,
            }
        })

        while(existingAccessCodes.find(obj => obj.accessCode === accessCode) !== undefined) accessCode = require('crypto').randomBytes(2).toString('hex').toUpperCase()

        results.content = await prisma.game.create({
            data: {
                accessCode: accessCode,
                status: 'Créée',
                owner: req.body.owner
            }
        })
        results.success = true
    } catch (e) {
        results.success = false
        results.content = e
    }

    res.json(results)
}