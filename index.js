const express = require('express')
const app = express()
const port = 3000

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const client = new SNSClient({ region: process.env.AWS_REGION | "us-east-2" });
const {downloadTopic} = JSON.parse(process.env.COPILOT_SNS_TOPIC_ARNS);

app.use(express.json())

app.get('/', (_req, res) => {
  res.send('Downtube API is running!')
})

app.post('/download', async (req, res) => {
  const videoId = req.body.video
  await client.send(new PublishCommand({
    Message: videoId,
    TopicArn: downloadTopic,
  }));
  res.status(201)
})

app.listen(port, () => {
  console.log(`downtube-api listening on port ${port}`)
})