import prisma from "../../../../utils/prisma"
import {shuffle} from "shuffle-seed"

export default async function getSolution(req, res) {
    try {
        const categories = await prisma.category.findMany({
            select: {
                title: true,
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
                Game: {
                    accessCode: req.body.accessCode
                }
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
                    response: {
                        id: photo.Response.find(element => element.user === req.body.user).User_Response_valueToUser.id,
                        username: photo.Response.find(element => element.user === req.body.user).User_Response_valueToUser.username,
                        profilePicture: photo.Response.find(element => element.user === req.body.user).User_Response_valueToUser.profilePicture,
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
        res.status(500).json(err)
    }
}