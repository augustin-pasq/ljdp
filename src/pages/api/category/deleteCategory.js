import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        await prisma.category.delete({
            where: {
                id: req.body.id,
            },
        })

        res.status(200).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}