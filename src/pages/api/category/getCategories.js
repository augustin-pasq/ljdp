import prisma from "../../../../utils/prisma"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(getCategories)

async function getCategories(req, res) {
    try {
        let code
        let result

        const game = await getGame(req.body.game, req.session.user.id, req.headers.referer.replace(req.headers.origin, "").split("/")[1])

        if (game.success) {
            // Pour chaque utilisateur (CROSS JOIN User), on sélectionne toutes les catégories avec la photo associée, puis on filtre par utilisateur et par partie
            // Utilisation de $queryRaw pour effectuer une requête SQL, faute de pouvoir faire de même avec Prisma
            const categories = await prisma.$queryRaw
                `SELECT Category.id, Category.title, Photo.link
                 FROM Category
                      CROSS JOIN User
                      LEFT JOIN Photo ON User.id = Photo.user AND Category.id = Photo.category
                 WHERE game = ${game.content.id} AND User.id = ${req.session.user.id};
                `

            code = 200
            result = {game: game.content, categories: categories}
        } else {
            code = 403
            result = game.message
        }

        res.status(code).json({content: result})
    } catch (err) {
        res.status(500).json(err)
    }
}

async function getGame(gameId, userId, page) {
    try {
        let response = await prisma.game.findFirst({
            where: {
                id: gameId
            }
        })

        let success = false
        let message = ""

        if (response === null) {
            message = "not_found"
        } else if (page === "edit" && response.owner !== userId) {
            message = "unauthorized"
        } else if (page === "play" && response.status === "started") {
            const participant = await prisma.participant.findUnique({
                where: {
                    game_user: {game: response.id, user: userId}
                }
            })

            if (participant === null) {
                message = "not_joined"
            } else {
                success = true
            }
        } else if (page !== "play" && response.status === "started") {
            message = "started"
        } else if (page !== "scores" && response.status === "ended") {
            message = "ended"
        } else {
            success = true
        }

        return {success: success, message: message, content: response}
    } catch (err) {
        return err
    }
}