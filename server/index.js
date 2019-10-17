const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/policy', (req, res) => {
  res.send(JSON.stringify({ greeting: `Hello!` }));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Express server is running on port:', port));
