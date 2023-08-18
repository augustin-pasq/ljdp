import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let results = {}

    try {
        if (req.body.action === "play") {
            results = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code,
                    status: "Commencée"
                }
            })
        } else if (req.body.action === "upload") {
            results = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code,
                    status: "Créée"
                }
            })
        } else if (req.body.action === "edit") {
            results = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code,
                    owner: req.body.owner
                }
            })
        }

        results !== null ? res.status(200).json(results) : res.status(404).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}