import prisma from "../../../../lib/prisma"
import bcrypt from "bcrypt"
import {withSessionRoute} from "../../../../lib/ironSession"

export default withSessionRoute(handle)

async function handle(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: req.body.username,
            }
        })

        if (user !== null) {
            const results = bcrypt.compareSync(req.body.password, user.password)

            if (results) {
                req.session.user = {...user, password: undefined, isLoggedIn: true}
                await req.session.save()

                res.status(200).json()
            } else res.status(401).json()
        } else res.status(404).json()

    } catch (err) {
        res.status(500).json(err)
    }
}