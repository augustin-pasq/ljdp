import prisma from "../../../../utils/prisma"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(getCategories)

async function getCategories(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                id: req.body.gameId,
            }
        })

        // Pour chaque utilisateur (CROSS JOIN User), on sélectionne toutes les catégories avec la photo associée, puis on filtre par utilisateur et par partie
        // Utilisation de $queryRaw pour effectuer une requête SQL, faute de pouvoir faire de même avec Prisma
        const categories = await prisma.$queryRaw
            `SELECT Category.id, Category.title, Photo.link
             FROM Category
                  CROSS JOIN User
                  LEFT JOIN Photo ON User.id = Photo.user AND Category.id = Photo.category
             WHERE game = ${game.id} AND User.id = ${req.session.user.id};
            `

        res.status(200).json({content: {game: game, categories: categories}})
    } catch (err) {
        res.status(500).json(err)
    }
}