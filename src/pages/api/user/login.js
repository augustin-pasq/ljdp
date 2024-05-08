import prisma from "../../../../utils/prisma"
import bcrypt from "bcrypt"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(login)

async function login(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: req.body.username,
            }
        })

        let response
        if (user !== null) {
            response = bcrypt.compareSync(req.body.password, user.password)

            if (response) {
                req.session.user = {...user, password: undefined, isLoggedIn: true}
                await req.session.save()
            }
        }

        res.status(200).json({success: response, content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}