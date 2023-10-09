import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    try {
        const gameData = await prisma.photo.findMany({
            select: {
                id: true,
                link: true,
                Category: {
                    select: {
                        title: true,
                    }
                }
            },
            where: {
                Category: {
                    Game: {
                        accessCode: req.body.accessCode
                    }
                }
            }
        })

        const participants = await prisma.participant.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        displayedName: true,
                        profilePicture: true,
                    }
                }
            },
            where: {
                hasPhotos: true,
                Game: {
                    accessCode: req.body.accessCode
                }
            }
        })

        const results = {
            categories: [],
            propositions: []
        }

        const insertedCategories = {}
        let index
        gameData.forEach((element) => {
            if(element.Category.title in insertedCategories) {
                index = insertedCategories[element.Category.title]
            } else {
                index = Object.keys(insertedCategories).length
                results.categories[index] = ({title: element.Category.title, photos: []})
                insertedCategories[element.Category.title] = index
            }

            results.categories[index]["photos"].push({id: element.id, link: element.link})
        })

        participants.forEach(element => {
            results.propositions.push({id: element.User.id, displayedName: element.User.displayedName, profilePicture: element.User.profilePicture})
        })

        res.status(200).json(results)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}