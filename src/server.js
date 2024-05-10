const {createServer} = require("http")
const next = require("next")
const socketIO = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
    const httpServer = createServer(handler)

    const io = new socketIO.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    })

    io.on("connection", async (socket) => {
        socket.on("userHasJoined", async (data) => {
            socket.join(data.game)

            const request = await fetch(`${process.env.NODE_ENV === "production" ? process.env.PROD_URL: process.env.DEV_URL}/api/participant/updateParticipant`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({game: data.game, user: data.user.id}),
            })

            if (request.status === 200) {
                const participantsData = await request.json()
                io.to(data.game).emit("userHasJoined", participantsData.content)
            }
        })

        socket.on("launchGame", async (data) => {
            const request = await fetch(`${process.env.NODE_ENV === "production" ? process.env.PROD_URL: process.env.DEV_URL}/api/game/setStatus`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: data.game.accessCode, status: "started"}),
            })

            if (request.status === 200) {
                io.to(data.game.id).emit("gameHasBeenLaunched")
            }
        })

        socket.on("userHasJoinedGame", (data) => {
            socket.join(data.game.id)
        })


        socket.on("changePhoto", (data) => {
            io.to(data.game.id).emit("changePhoto")
        })

        socket.on("getSolution", (data) => {
            io.to(data.game.id).emit("getSolution")
        })

        socket.on("getScores", async (data) => {
            const request = await fetch(`${process.env.NODE_ENV === "production" ? process.env.PROD_URL: process.env.DEV_URL}/api/game/setStatus`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: data.game.accessCode, status: "ended"}),
            })

            if (request.status === 200) {
                io.to(data.game.id).emit("getScores")
            }
        })
    })

    httpServer
        .once("error", (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port)
})