import prisma from "../../../../lib/prisma"
import {shuffle} from "shuffle-seed";

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
                                displayedName: true,
                                profilePicture: true
                            }
                        },
                        Response: {
                            select: {
                                User_Response_valueToUser: {
                                    select: {
                                        id: true,
                                        username: true,
                                        displayedName: true,
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
                },
                Photo: {
                    some: {
                        Response: {
                            some: {
                                user: req.body.user
                            }
                        }
                    }
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
                        id: photo.User.id,
                        username: photo.User.username,
                        displayedName: photo.User.displayedName,
                        profilePicture: photo.User.profilePicture,
                    },
                    solution: {
                        id: photo.Response[0].User_Response_valueToUser.id,
                        username: photo.Response[0].User_Response_valueToUser.username,
                        displayedName: photo.Response[0].User_Response_valueToUser.displayedName,
                        profilePicture: photo.Response[0].User_Response_valueToUser.profilePicture,
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