'use strict'
/////////////////////////////////Requiered all dependencies (Setting up the app)////////////////////////
require('dotenv').config();
const express = require('express')
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;

///////////////////////////// Initializing the Server////////////////////////////
const app = express();

///////////////////////////////
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }));

///Routes Definition

app.get('/hello', (req, res) => {
    res.render('pages/index')
})




app.listen(PORT , console.log(`Up and running on ${PORT}`))