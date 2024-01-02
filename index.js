import express, { json } from "express"
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"
import { Server } from "socket.io"
import { createServer } from "node:http"


const region = "us-east-2"
const port = 80

// Server
const app = express()
const server = createServer(app)

// Socket
const io = new Server(server)
var clientMap = {}

// Messaging
const snsClient = new SNSClient({ region: region })
const { downloadTopic } = JSON.parse(process.env.COPILOT_SNS_TOPIC_ARNS)

app.use(json())

app.get('/', (_req, res) => {
  res.send('Downtube API is running!')
})

app.post('/download', async (req, res) => {
  const video = req.body.video
  console.log(`request received: ${video}`)
  await snsClient.send(new PublishCommand({
    Message: video,
    TopicArn: downloadTopic,
  }))
  console.log('download event emitted')
  res.status(201).end()
})

app.post('/complete', async (req, res) => {
  console.log(`audio received: ${req.body.title}`)
  const socket = clientMap[req.body.videoID]
  if (socket != null) {
    socket.emit("download complete", req.body.url)
  }
  res.status(200).end()
})

io.on('connection', (socket) => {
  socket.on('download video', (msg) => {
    const url = new URL(msg)
    const searchParam = new URLSearchParams(url.search)
    const videoID = searchParam.get("v")
    clientMap[videoID] = socket
    console.log(videoID)
  })
})

server.listen(port, async () => {
  console.log(`downtube-api listening on port ${port}`)
})
