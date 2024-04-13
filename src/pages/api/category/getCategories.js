import prisma from "../../../../lib/prisma"

export default async function getCategories(req, res) {
    try {
        const game = await prisma.game.findFirst({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        // Pour chaque utilisateur (CROSS JOIN User), on sélectionne toutes les catégories avec la photo associée, puis on filtre par utilisateur et par partie
        // Utilisation de $queryRaw pour effectuer une requête SQL, faute de pouvoir faire de même avec Prisma
        const response = await prisma.$queryRaw
            `SELECT Category.id, Category.title, Photo.link
             FROM Category
                  CROSS JOIN User
                  LEFT JOIN Photo ON User.id = Photo.user AND Category.id = Photo.category
             WHERE game = ${game.id} AND User.id = ${req.body.user};
            `

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}