import {withIronSessionApiRoute, withIronSessionSsr} from "iron-session/next";

const sessionOptions = {
    cookieName: "ljdp-session-cookie",
    password: process.env.COOKIE_PASSWORD,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
}

export function withSessionRoute(handler) {
    return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr(handler) {
    return withIronSessionSsr(handler, sessionOptions);
}