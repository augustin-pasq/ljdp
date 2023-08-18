import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        const results = await prisma.photo.findFirst({
            select: {
                link: true
            },
            where: {
                category: req.body.category,
                user: req.body.user
            }
        })

        results !== null ? res.status(200).json(results) : res.status(404).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}