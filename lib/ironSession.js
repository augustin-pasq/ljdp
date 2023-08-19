import {withIronSessionApiRoute, withIronSessionSsr} from "iron-session/next"

const sessionOptions = {
    cookieName: "ljdp-session-cookie",
    password: process.env.COOKIE_PASSWORD,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
}

export function withSessionRoute(handle) {
    return withIronSessionApiRoute(handle, sessionOptions)
}

export function withSessionSsr(handle) {
    return withIronSessionSsr(handle, sessionOptions)
}

export async function checkIfUserIsLoggedIn({req}) {
    const user = req.session.user

    if (!user?.isLoggedIn) {
        return {
            redirect: {
                permanent: false, destination: "/login"
            }
        }
    }

    return {
        props: {
            user: user.id
        }
    }
}