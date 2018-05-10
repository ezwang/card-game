#!/usr/bin/env nodejs

const express = require('express');
const ws = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });

app.use(express.static('public'));

server.listen(process.env.PORT || 5000, () => {
    console.log(`Server started on port ${server.address().port}...`);
});
