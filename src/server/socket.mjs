import http from "http"
import {Server} from "socket.io"

const server = http.createServer((req, res) => {
    res.writeHead(302, {location: 'localhost:3000'})
    res.end()
})

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
    socket.on("setHasJoined", (data) => {
        io.emit("userHasJoined", data)
    })

    socket.on("launchGame", () => {
        io.emit("gameHasBeenLaunched")
    })

    socket.on("changePhoto", () => {
        io.emit("changePhoto")
    })

    socket.on("getSolution", () => {
        io.emit("getSolution")
    })

    socket.on("getScores", () => {
        io.emit("getScores")
    })
})

server.listen(4000)