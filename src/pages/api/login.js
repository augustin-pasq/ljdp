import prisma from "../../../lib/prisma"
import bcrypt from "bcrypt";

export default async function handle(req, res) {
    let results = {"success" : "", result : []}

    try {
        let user = await prisma.user.findUnique({
            where: {
                username: req.body.username,
            }
        })

        results.result = user !== null ? bcrypt.compareSync(req.body.password, user.password) : false
        results.success = true
    } catch (e) {
        results.success = false
        results.result = e
    }

    res.json(results)
}