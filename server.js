'use strict'
/////////////////////////////////Requiered all dependencies (Setting up the app)////////////////////////
require('dotenv').config();
const express = require('express')
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;

///////////////////////////// Initializing the Server////////////////////////////
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

///////////////////////////////
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }));

///////////////////////////// Routes Definition and routes handlers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.get('/', getBooks)
app.get('/add', (req, res) => {    
    res.render( 'pages/searches/new')
})

app.post('/searches', (req, res) => {
    let url;
    const userInput = req.body.bookSearch;
    const searchType = req.body.searchType;
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
        // console.log(googleLibrary);
        
        let googleBooks = googleLibrary.map( value => {
           let creatingBookIns =  new Book (userInput, value);
           const SQL = 'INSERT INTO gobooks(img_url, title, author, description) VALUES ($1,$2,$3,$4) RETURNING *;'
           let safeValues = Object.values(creatingBookIns)
        //    console.log("HELLLLLLLLLLLOOOOOOOOOOOOO",safeValues);

        client.query(SQL, safeValues)
        .then(data =>{
            // console.log(data);
        })
          return creatingBookIns
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
    // this.isbn;
    // this.bookshelf;
}

function getBooks(req, res){
    const SQL = 'SELECT * FROM goBooks; ';
    client
    .query(SQL)
    .then(data => {
        console.log(data);
        
        res.render('pages/index', {sqldata : data.rows});
    })
}

function errorHandler(req, res, error){
    res.status(500).json(error)
}


client
.connect()
.then(() => {
    app.listen(PORT , console.log(`Up and running on ${PORT}`))
}).catch((error =>{
    throw new Error(`startup error ${error}`);
}))
