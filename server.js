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

///////////////////////////// Routes Definition and routes handlers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.get('/hello', (req, res) => {
    res.render('pages/index')
})
app.get('/add', (req, res) => {    
    res.render( 'pages/searches/new')
})

app.post('/searches', (req, res) => {
    let url;
    const userInput = req.body.bookSearch;
    const searchType = req.body.searchType
    console.log('in',req.body);
    if(searchType === "title"){
        url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${userInput}`
    } else{

        url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${userInput}`
    }
    ////// or we can use one URL that take two values`https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${userInput}`

    superagent.get(url)
    .then(googleBooksData => {
        // console.log(googleBooksData.body.items);
        const googleLibrary = googleBooksData.body.items;
        let googleBooks = googleLibrary.map( value => {
            
          return new Book (userInput, value);
            
        })
        
        res.render('pages/searches/show', {boooks:googleBooks})
        // res.status(200).json(googleLibrary)
        
    })
} )


////////////////////////////// Constructor \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function Book (userInput, googleApiRes){
    this.img = googleApiRes.volumeInfo.imageLinks && googleApiRes.volumeInfo.imageLinks.thumbnail || `https://via.placeholder.com/250x300/000000`;
    this.title = googleApiRes.volumeInfo && googleApiRes.volumeInfo.title || userInput;
    this.author = googleApiRes.volumeInfo.authors || userInput;
    this.overview = googleApiRes.volumeInfo.description;
}


app.listen(PORT , console.log(`Up and running on ${PORT}`))