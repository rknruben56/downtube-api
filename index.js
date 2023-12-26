import express, { json } from "express"
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"

const region = "us-east-2"

// Server
const app = express()
const port = 80

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
  res.status(200).end()
})

app.listen(port, async () => {
  console.log(`downtube-api listening on port ${port}`)
})
