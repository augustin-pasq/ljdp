import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let results = {"success" : undefined, content : []}

    try {
        if (req.body.action === "play") {
            results.content = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code,
                    status: "Commencée"
                }
            })
        } else if (req.body.action === "upload") {
            results.content = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code,
                    status: "Créée"
                }
            })
        } else if (req.body.action === "edit") {
            results.content = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code
                }
            })
        }

        results.success = true
    } catch (e) {
        results.success = false
        results.content = e
    }

    res.json(results)
}