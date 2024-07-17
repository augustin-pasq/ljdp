import prisma from "../../../../utils/prisma"
import {shuffle} from "shuffle-seed"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(getSolution)

async function getSolution(req, res) {
    try {
        const categories = await prisma.category.findMany({
            select: {
                title: true,
                type: true,
                shuffleSeed: true,
                Photo: {
                    select: {
                        link: true,
                        User: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true
                            }
                        },
                        Response: {
                            select: {
                                user: true,
                                User_Response_valueToUser: {
                                    select: {
                                        id: true,
                                        username: true,
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                game: req.body.game
            }
        })

        const response = {
            photos: [],
            propositions: []
        }

        categories.forEach(category => {
            const shuffledPhotos = shuffle(category.Photo, category.shuffleSeed)
            const formattedShuffledPhotos = shuffledPhotos.map(photo => {
                return {
                    category: category.title,
                    link: photo.link,
                    type: category.type,
                    response: {
                        id: photo.Response.find(element => element.user === req.session.user.id).User_Response_valueToUser.id,
                        username: photo.Response.find(element => element.user === req.session.user.id).User_Response_valueToUser.username,
                        profilePicture: photo.Response.find(element => element.user === req.session.user.id).User_Response_valueToUser.profilePicture,
                    },
                    solution: {
                        id: photo.User.id,
                        username: photo.User.username,
                        profilePicture: photo.User.profilePicture,
                    }
                }
            })

            response.photos = response.photos.concat(formattedShuffledPhotos)
        })

        res.status(200).json({content: response})
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}