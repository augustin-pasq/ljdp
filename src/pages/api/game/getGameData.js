import prisma from "../../../../lib/prisma"
import {shuffle} from "shuffle-seed"

export default async function getGameData(req, res) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                accessCode: req.body.accessCode,
            }
        })

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
                game: game.id
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
                game: game.id
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

        res.status(200).json({content: {game: game, gameData: gameData}})
    } catch (err) {
        res.status(500).json(err)
    }
}