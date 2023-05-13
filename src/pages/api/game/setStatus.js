import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let results = {"success" : undefined, content : []}

    try {
        results.content = await prisma.game.update({
            where: {
                accessCode: req.body.accessCode,
            },
            data: {
                status: req.body.status
            }
        })
        results.success = true
    } catch (e) {
        results.success = false
        results.content = e
    }

    res.json(results)
}