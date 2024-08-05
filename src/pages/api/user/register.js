import prisma from "../../../../utils/prisma"
import bcrypt from "bcrypt"
import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(register)

async function register(req, res) {
    const hash = bcrypt.hashSync(req.body.password, 10)

    try {
        const response = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hash,
                profilePicture: `https://api.dicebear.com/9.x/miniavs/svg?seed=${req.body.username}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
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