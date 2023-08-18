import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        const photo = await prisma.photo.findFirst({
            where: {
                link: req.body.link,
            },
        })

        await prisma.photo.delete({
            where: {
                id: photo.id
            }
        })

        res.status(200).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}