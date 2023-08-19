import {withSessionRoute} from "../../../../lib/ironSession"

export default withSessionRoute(handle)

async function handle(req, res) {
    try {
        req.session.destroy()
        res.status(200).json({})
    } catch (err) {
        res.status(500).json(err)
    }
}