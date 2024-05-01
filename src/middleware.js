export function middleware(req) {
    //return NextResponse.redirect(new URL('/', req.url))
}

export const config = {
    matcher: '/api/:path*',
}