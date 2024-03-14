import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

        // Pour chaque photo, on sélectionne ses infos, sa catégorie, l'utilisateur correspondant à la réponse (ResponseUser) et l'utilisateur correspondant à la solution (ResponseSolution)
        // Utilisation de $queryRaw pour effectuer une requête SQL, faute de pouvoir faire de même avec Prisma
        const solution = await prisma.$queryRaw
            `SELECT Photo.id,
                    Photo.link,
                    Category.title,
                    ResponseUser.id ResponseUserId,
                    ResponseUser.displayedName ResponseUserDisplayedName,
                    ResponseUser.profilePicture ResponseUserProfilePicture,
                    ResponseSolution.id ResponseSolutionId,
                    ResponseSolution.displayedName ResponseSolutionDisplayedName,
                    ResponseSolution.profilePicture ResponseSolutionProfilePicture
             FROM Photo
                      JOIN Category ON Category.id = Photo.category
                      JOIN Response ON Response.photo = Photo.id
                      JOIN Game ON Category.game = ${game.id}
                      JOIN User ResponseUser ON Response.value = ResponseUser.id
                      JOIN User ResponseSolution ON Photo.user = ResponseSolution.id
             WHERE Response.user = ${req.body.user};
            `

        const response = {
            categories: []
        }

        const insertedCategories = {}
        let index
        solution.forEach((element) => {
            if(element.title in insertedCategories) {
                index = insertedCategories[element.title]
            } else {
                index = Object.keys(insertedCategories).length
                response.categories[index] = ({title: element.title, photos: []})
                insertedCategories[element.title] = index
            }

            response.categories[index]["photos"].push({id: element.id, link: element.link, response: {id: element.ResponseUserId, displayedName: element.ResponseUserDisplayedName, profilePicture: element.ResponseUserProfilePicture}, solution: {id: element.ResponseSolutionId, displayedName: element.ResponseSolutionDisplayedName, profilePicture: element.ResponseSolutionProfilePicture}})
        })

        await prisma.game.update({
            where: {
                accessCode: req.body.accessCode,
            },
            data: {
                status: 4
            }
        })

        res.status(200).json({content: response})
    } catch (err) {
        res.status(500).json(err)
    }
}