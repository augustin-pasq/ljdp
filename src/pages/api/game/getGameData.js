import prisma from "../../../../utils/prisma"
import {shuffle} from "shuffle-seed"

export default async function getGameData(req, res) {
    try {
        const categories = await prisma.category.findMany({
            select: {
                title: true,
                shuffleSeed: true,
                Photo: {
                    select: {
                        id: true,
                        link: true
                    }
                }
            },
            where: {
                game: req.body.game
            }
        })

        const participants = await prisma.participant.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    }
                }
            },
            where: {
                hasPhotos: true,
                game: req.body.game
            }
        })

        const gameData = {
            photos: [],
            propositions: []
        }

        categories.forEach(category => {
            const shuffledPhotos = shuffle(category.Photo, category.shuffleSeed)
            const formattedShuffledPhotos = shuffledPhotos.map(photo => {
                return {...photo, category: category.title}
            })
            gameData.photos = gameData.photos.concat(formattedShuffledPhotos)
        })

        participants.forEach(participant => {
            gameData.propositions.push({ id: participant.User.id, username: participant.User.username, profilePicture: participant.User.profilePicture })
        })

        res.status(200).json({content: gameData})
    } catch (err) {
        res.status(500).json(err)
    }
}