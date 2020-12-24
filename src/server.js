const express = require('express');
const app = express();
const path = require('path');

app.get('/hey', (req, res) => res.send('hello!'))

app.listen(8080)