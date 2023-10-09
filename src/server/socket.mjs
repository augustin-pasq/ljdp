import http from "http";
import {Server} from "socket.io"
import chalk from "chalk";

const server = http.createServer((req, res) => {
    res.writeHead(302, {location: 'http://localhost:3000'})
    res.end()
})

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
    socket.on("userHasJoined", (data) => {
        console.log(`${chalk.green("✓")} ${data.user.username} joined the game with id ${data.game.id}`)
        io.emit("userHasJoined", data)
    })

    socket.on("gameModeHasChanged", (data) => {
        console.log(`${chalk.green("✓")} The mode of the game with access code ${data.accessCode} is now ${data.gameMode}`)
        io.emit("gameModeHasChanged", data.gameMode)
    })
})

server.listen(4000, () => {
    console.log(`\t${chalk.magenta("🞅 Socket.io")}\n  - Local:\t\thttp://localhost:4000\n\n${chalk.green("✓")} Ready`)
})