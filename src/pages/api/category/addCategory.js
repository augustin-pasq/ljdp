import prisma from "../../../../utils/prisma"
import {randomBytes} from "node:crypto"

export default async function addCategory(req, res) {
    try {
        const response = await prisma.category.create({
            data: {
                title: req.body.title,
                shuffleSeed: randomBytes(32).toString("hex"),
                game: req.body.game,
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}