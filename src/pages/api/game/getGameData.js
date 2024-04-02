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
                        username: true,
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

        const response = {
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
                response.categories[index] = ({title: element.Category.title, photos: []})
                insertedCategories[element.Category.title] = index
            }

            response.categories[index]["photos"].push({id: element.id, link: element.link})
        })

        participants.forEach(element => {
            response.propositions.push({id: element.User.id, username: element.User.username, displayedName: element.User.displayedName, profilePicture: element.User.profilePicture})
        })

        res.status(200).json({content: response})
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}