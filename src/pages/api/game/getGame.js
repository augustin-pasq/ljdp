import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    let results = {}
    let code = 200

    try {
        if (req.body.action === "edit") {
            results = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code,
                    owner: req.body.owner
                }
            })

            if(results === null) { code = 403; results = {} }
        } else {
            results = await prisma.game.findFirst({
                where: {
                    accessCode: req.body.code
                }
            })

            if(results === null) { code = 404; results = {} }
            if(results.status === 4) { code = 423; results = {} }
        }

        res.status(code).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}