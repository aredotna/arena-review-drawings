const express = require('express');
const axios = require('axios');
const { print } = require('graphql');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const GET_POLICY = require('./queries/policy');
const CREATE_BLOCK = require('./mutations/createBlock');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { X_AUTH_TOKEN, X_APP_TOKEN, CHANNEL_ID } = process.env;

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.get('/api/policy', (req, res) => {
  axios({
    url: 'https://api.are.na/graphql',
    method: 'post',
    headers: {
      'X-AUTH-TOKEN': X_AUTH_TOKEN,
      'X-APP-TOKEN': X_APP_TOKEN,
    },
    data: {
      query: print(GET_POLICY),
    },
  }).then(result => {
    res.json(result.data.data.me.policy);
  });
});

app.post('/api/create', (req, res) => {
  axios({
    url: 'https://api.are.na/graphql',
    method: 'post',
    headers: {
      'X-AUTH-TOKEN': X_AUTH_TOKEN,
      'X-APP-TOKEN': X_APP_TOKEN,
    },
    data: {
      query: print(CREATE_BLOCK),
      variables: {
        input: {
          title: req.body.title,
          channel_ids: [CHANNEL_ID],
          value: req.body.url,
          description: req.body.description,
        },
      },
    },
  })
    .then(result => {
      res.json(result.data);
    })
    .catch(err => {
      console.log('err', err.description);
      res.send(req.body);
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Express server is running on port:', port));
