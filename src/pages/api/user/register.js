import prisma from "../../../../lib/prisma"
import bcrypt from "bcrypt"
import {withSessionRoute} from "../../../../lib/ironSession"

export default withSessionRoute(handle)

async function handle(req, res) {
    const hash = bcrypt.hashSync(req.body.password, 10)

    try {
        const response = await prisma.user.create({
            data: {
                username: req.body.username,
                displayedName: req.body.username,
                password: hash,
                profilePicture: `profile_pictures/default_profile_picture_${Math.floor(Math.random() * (8 - 1) + 1)}.png`
            }
        })

        req.session.user = {...response, password: undefined, isLoggedIn: true}
        await req.session.save()

        res.status(200).json({success: true, content: response})
    } catch (err) {
        if (err.code === "P2002") res.status(200).json({success: false, content: err})
        else res.status(500).json(err)
    }
}