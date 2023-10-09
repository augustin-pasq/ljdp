import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        await prisma.response.create({
            data: {
                user: req.body.user,
                photo: req.body.photo,
                value: req.body.response
            }
        })

        res.status(200).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}