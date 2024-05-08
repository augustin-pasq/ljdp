import {withSessionRoute} from "../../../../utils/ironSession"

export default withSessionRoute(logout)

async function logout(req, res) {
    try {
        req.session.destroy()
        res.status(200).json({content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}