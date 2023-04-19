import prisma from "../../../lib/prisma"
import bcrypt from "bcrypt";

export default async function handle(req, res) {
    let results = {"success" : "", result : []}
    const hash = bcrypt.hashSync(req.body.password, 10)

    try {
        results.result = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hash
            }
        })
        results.success = true
    } catch (e) {
        results.success = false
        results.result = e
    }

    res.json(results)
}