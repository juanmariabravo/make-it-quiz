import { createServer } from "node:http"
import next from "next"
import { WebSocketServer } from "ws"

const dev = !process.argv.includes("--production")
const port = Number(process.env.PORT || 3000)
const app = next({ dev })
const handle = app.getRequestHandler()
const rooms = new Map()

const roomCode = () => {
  let code
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString()
  } while (rooms.has(code))
  return code
}

const send = (client, message) => client.readyState === 1 && client.send(JSON.stringify(message))
const broadcast = (room, message) => room.players.forEach((player) => send(player.socket, message))

const publicPlayers = (room) => room.players.map(({ id, name, score, answered }) => ({ id, name, score, answered }))

const broadcastRoom = (room) => broadcast(room, { type: "room", code: room.code, players: publicPlayers(room), hostId: room.hostId, phase: room.phase })

const broadcastQuestion = (room) => {
  const question = room.questions[room.questionIndex]
  room.phase = "question"
  room.questionStartedAt = Date.now()
  room.players.forEach((player) => { player.answered = false })
  broadcast(room, {
    type: "question",
    index: room.questionIndex,
    total: room.questions.length,
    question: { question: question.question, options: question.options, points: question.points || 1 },
    endsAt: room.questionStartedAt + room.questionDuration,
  })
  broadcastRoom(room)
  clearTimeout(room.timer)
  room.timer = setTimeout(() => showResults(room), room.questionDuration)
}

const showResults = (room) => {
  if (room.phase !== "question") return
  room.phase = "results"
  clearTimeout(room.timer)
  const question = room.questions[room.questionIndex]
  broadcast(room, {
    type: "results",
    correctAnswer: question.answer,
    players: publicPlayers(room),
    lastQuestion: room.questionIndex === room.questions.length - 1,
  })
  broadcastRoom(room)
}

const nextQuestion = (room) => {
  if (room.questionIndex >= room.questions.length - 1) {
    room.phase = "finished"
    broadcast(room, { type: "finished", players: publicPlayers(room) })
    broadcastRoom(room)
    return
  }
  room.questionIndex += 1
  broadcastQuestion(room)
}

const handleMessage = (socket, message) => {
  if (message.type === "create") {
    const room = {
      code: roomCode(),
      hostId: message.playerId,
      players: [{ id: message.playerId, name: message.name || "Anfitrión", score: 0, answered: false, socket }],
      questions: message.questions,
      questionDuration: 15000,
      questionIndex: 0,
      phase: "lobby",
      timer: null,
    }
    rooms.set(room.code, room)
    socket.roomCode = room.code
    socket.playerId = message.playerId
    send(socket, { type: "created", code: room.code })
    broadcastRoom(room)
    return
  }

  const room = rooms.get(message.code)
  if (!room) return send(socket, { type: "error", message: "La sala no existe o ha caducado." })

  if (message.type === "join") {
    if (room.phase !== "lobby") return send(socket, { type: "error", message: "La partida ya ha comenzado." })
    if (room.players.length >= 30) return send(socket, { type: "error", message: "La sala está llena." })
    if (room.players.some((player) => player.id === message.playerId)) {
      return send(socket, { type: "error", message: "Ya hay un jugador conectado con esa identidad." })
    }
    room.players.push({ id: message.playerId, name: message.name || "Jugador", score: 0, answered: false, socket })
    socket.roomCode = room.code
    socket.playerId = message.playerId
    send(socket, { type: "joined", code: room.code })
    broadcastRoom(room)
  } else if (message.type === "start" && message.playerId === room.hostId) {
    broadcastQuestion(room)
  } else if (message.type === "answer" && room.phase === "question") {
    const player = room.players.find((item) => item.id === message.playerId)
    if (!player || player.answered) return
    player.answered = true
    const question = room.questions[room.questionIndex]
    const remaining = Math.max(0, room.questionStartedAt + room.questionDuration - Date.now())
    const correct = message.answer === question.answer
    const points = correct ? Math.max(100, Math.round((remaining / room.questionDuration) * 1000)) : 0
    player.score += points
    send(socket, {
      type: "answer_feedback",
      correct,
      points,
    })
    broadcastRoom(room)
    if (room.players.every((item) => item.answered)) showResults(room)
  } else if (message.type === "next" && message.playerId === room.hostId && room.phase === "results") {
    nextQuestion(room)
  }
}

await app.prepare()
const server = createServer((request, response) => handle(request, response))
const wss = new WebSocketServer({ server, path: "/ws" })
wss.on("connection", (socket) => {
  socket.on("message", (raw) => {
    try { handleMessage(socket, JSON.parse(raw.toString())) }
    catch { send(socket, { type: "error", message: "Mensaje no válido." }) }
  })
  socket.on("close", () => {
    const room = rooms.get(socket.roomCode)
    if (!room) return
    room.players = room.players.filter((player) => player.socket !== socket)
    if (room.players.length === 0) {
      clearTimeout(room.timer)
      rooms.delete(room.code)
    } else {
      if (socket.playerId === room.hostId) room.hostId = room.players[0].id
      broadcastRoom(room)
    }
  })
})
server.listen(port, () => console.log(`make-it-quiz listening on http://localhost:${port}`))
