const express = require('express')
const app = express()
const port = 3001
const data = require('./questions.json');

app.get('/data', (req, res) => res.json(data));
app.use(express.static('../client'));


app.listen(port, () => console.log(`Example app listening on port ${port}!`))