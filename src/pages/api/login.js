import prisma from "../../../lib/prisma"
import bcrypt from "bcrypt";
import {withSessionRoute} from "../../../lib/ironSession";

export default withSessionRoute(handleLogin);

async function handleLogin(req, res) {
    let results = {"success" : undefined, content : []}

    try {
        let user = await prisma.user.findUnique({
            where: {
                username: req.body.username,
            }
        })

        results.content = user !== null ? bcrypt.compareSync(req.body.password, user.password) : false

        if (results.content) {
            req.session.user = {...user, password: undefined, isLoggedIn: true}
            await req.session.save()
        }

        results.success = true
    } catch (e) {
        results.success = false
        results.content = e
    }

    res.json(results)
}