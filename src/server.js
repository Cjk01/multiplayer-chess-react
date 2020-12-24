// This server is for handling chess move requests and will act as an endpoint 
const express = require('express');
app = express();
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(PORT, () => {
    console.log(` listening at http://localhost:${PORT}`)
  })


