const express = require('express');
const { processHandler } = require('./express/process.handler');

const app = express();
const expressStartTime = new Date().toString();

app.use(express.json());
app.post('/process', (req, res) => {
  const startTime = performance.now();
  const { message, datasetPath, strict } = req.body;

  const result = processHandler.processHandler(message, datasetPath, strict);
  const endTime = performance.now();

  res.json({ result, time: endTime - startTime, expressStartTime });
});

app.listen(3000);
