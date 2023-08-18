import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        const game = await prisma.game.findFirst({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        // On utilise ici une queryRaw pour faire un full join entre Category et Photo, impossible avec Prisma
        const results = await prisma.$queryRaw
            `SELECT Category.id, title, type, link FROM Category
            LEFT JOIN Photo ON Category.id = Photo.category
            WHERE game = ${game.id} AND (user = ${req.body.user} OR user IS NULL)
            UNION
            SELECT Category.id, title, type, link FROM Category
            LEFT JOIN Photo ON Category.id = Photo.category
            WHERE game = ${game.id} AND (user = ${req.body.user} OR user IS NULL)`

        res.status(200).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}