import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        const game = await prisma.game.findFirst({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        // Pour chaque utilisateur (CROSS JOIN User), on sélectionne toutes les catégories avec la photo associée, puis on filtre par utilisateur et par partie
        // Utilisation de $queryRaw pour effectuer une requête SQL, faute de pouvoir faire de même avec Prisma
        const results = await prisma.$queryRaw
            `SELECT Category.id AS categoryId, Category.title, Category.type, Photo.link, game, User.id AS userId
             FROM Category
                      CROSS JOIN User
                      LEFT JOIN Photo ON User.id = Photo.user AND Category.id = Photo.category
             WHERE game = ${game.id} AND User.id = ${req.body.user};
            `

        res.status(200).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}