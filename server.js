"use strict";
/////////////////////////////////Requiered all dependencies (Setting up the app)////////////////////////
require("dotenv").config();
const express = require("express");
const pg = require("pg");
const cors = require("cors");
const superagent = require("superagent");
const methodoverride = require('method-override')
const PORT = process.env.PORT || 4000;

///////////////////////////// Initializing the Server////////////////////////////
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

///////////////////////////////////////// Middlewares \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
app.use(cors());
app.set("view engine", "ejs");
app.use(methodoverride('_method'));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

///////////////////////////// Routes Definition and routes handlers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.get("/", getBooks);
app.get("/add", (req, res) => { res.render("pages/searches/new"); });
app.put('/books/:bookid', bookUpdate);
app.post("/searches", searchHandler);
app.post("/books", collection);
app.get("/books/:bookid", specificBook);
app.delete('/books/:bookid', bookDel);

// app.use('*', notFoundHandler)

///////////////////////////////////////////////// Route Handler \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function searchHandler(req, res) {
  let url;
  const userInput = req.body.bookSearch;
  const searchType = req.body.searchType;
  if (searchType === "title") {
    url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${userInput}`;
  } else {
    url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${userInput}`;
  }
  ////// or we can use one URL that take two values`https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${userInput}`
  superagent.get(url).then((googleBooksData) => {
    const googleLibrary = googleBooksData.body.items;
    // console.log(googleLibrary[0].volumeInfo.categories);

    let googleBooks = googleLibrary.map((value) => {
      let creatingBookIns = new Book(userInput, value);
      return creatingBookIns;
    });
    res.render("pages/searches/show", { boooks: googleBooks });
  });
}

function getBooks(req, res) {
  const SQL = "SELECT * FROM goBooks; ";
  client.query(SQL).then((data) => {
    // console.log(data);
    res.render("pages/index", { sqldata: data.rows });
  });
}

function specificBook(req, res) {
  const SQL = "SELECT * FROM gobooks WHERE id=$1;";
  let safeValues = [req.params.bookid];
  client.query(SQL, safeValues).then((data) => {
    // console.log(data.rows);
    res.render("pages/books/detail", { partbook: data.rows[0] });
    console.log('hiiiiiiiiiiiiiiiii');
    
    const SQL2 = 'SELECT DISTINCT bookshelf FROM gobooks'
    client.query(SQL2)
    .then(data => {
    //  res.render("pages/books/detail", { typebook: data.rows })
      
    })
  });
  // console.log(req.params);
}

function collection(req, res) {
  let addBook = req.body.add;
  // console.log(req.body.add);

  const SQL =
    "INSERT INTO gobooks(img_url, title, author, description, isbn, bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;";
  let safeValues = [addBook[0], addBook[1], addBook[2], addBook[3], addBook[4], addBook[5]];
  ////////////// OR we can use object deconstructing like {img, author, title, overview} = creatingBookIns
  ///////////// they must be the same name as the properties we can accsess the properties without obj.propertiy
  client.query(SQL, safeValues).then(() => {
    res.status(200).redirect("/");
  });
}

function bookUpdate(req, res) {
  const updateContent = req.body;
  SQL = 'UPDATE gobooks SET title = $1, author=$2, isbn=$3, img_url=$4, decription=$5, bookshelf=$6 Where id=$7;';
  safeValues= Object.values(updateContent);
  safeValues.push(req.params);
  client.query(SQL, safeValues)
  .then( data =>{
    console.log(data);
    
  })
  
}


function bookDel(req, res) {
  let deleteBook = req.params.bookid;
  const SQL = 'DELETE FROM gobooks WHERE id=$1'
  let safeValues = [deleteBook];
  client.query(SQL, safeValues)
    .then(data => {
      res.redirect('/');
    })
    .catch(error => {
      errorHandler(req, res, error)
    })
}

////////////////////////////// Constructor \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function Book(userInput, googleApiRes) {
  this.img = (true && googleApiRes.volumeInfo.imageLinks.thumbnail) || `https://via.placeholder.com/250x300/000000`;
  this.title = (true && googleApiRes.volumeInfo.title) || userInput;
  this.author = (true && googleApiRes.volumeInfo.authors) || userInput;
  this.overview = googleApiRes.volumeInfo.description;
  this.isbn =(true && googleApiRes.volumeInfo.industryIdentifiers[0].identifier) || "Not FOUND!!";
  this.bookShelf = (googleApiRes.volumeInfo.categories && googleApiRes.volumeInfo.categories[0]) || 'Not FOUND!!'
}

function errorHandler(req, res, error) {
  res.render("pages/error", { fault: error });
}
function notFoundHandler(req, res) {
  res.status(404).send("Page Not Found");
}

client
  .connect()
  .then(() => {
    app.listen(PORT, console.log(`Up and running on ${PORT}`));
  })
  .catch((error) => {
    throw new Error(`startup error ${error}`);
  });
