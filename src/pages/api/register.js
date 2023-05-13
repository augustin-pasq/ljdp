import prisma from "../../../lib/prisma"
import bcrypt from "bcrypt";
import { withSessionRoute } from "../../../lib/ironSession";

export default withSessionRoute(handle);

async function handle(req, res) {
    let results = {"success" : undefined, content : []}
    const hash = bcrypt.hashSync(req.body.password, 10)

    try {
        results.content = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hash
            }
        })

        req.session.user = {...results.content, password: undefined, isLoggedIn: true}
        await req.session.save()

        results.success = true
    } catch (e) {
        results.success = false
        results.content = e
    }

    res.json(results)
}