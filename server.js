//Dependencies
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");


var app = express();




// Require all models
var db = require("./models");

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
//connect to database
mongoose.connect("mongodb://localhost/ArticleScrape", { useNewUrlParser: true });


//Html Routes

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://globalnews.ca/").then(function(response) {

    // Load the Response into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);
    
  
    // An empty array to save the data that we'll scrape
    //var results = [];
  
    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("article").each(function(i, element) {
        //Save an empty result object
        
      var result= {};
      
      

        result.title = $(element).find("a").text();
        result.link = $(element).children().attr("href");
      result.text = $(".story-txt").find("p");
      
      console.log("header = " + result.title)
      //console.log("link:" + result.link)
      //console.log("story text = " + result.text)
      
      
     db.Article.create(result)
     .then(function(dbArticle){
       console.log(dbArticle)
     })

    .catch(function(err){
      console.log(err)
    });
    });
  
    // Log the results once you've looped through each of the elements found with cheerio
  res.send("Scrape complete <br> <a href='/'> Previous</a>");
  
  });
});

app.get("/articles", function(req,res){
    db.Article.find({}, function(err,found){
      if(err){
        console.log(err)
      } else {
        res.json(found)
      }
    })
});

app.get("/articles/id:", function(req,res){
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id})
    // ..and populate all of the notes associated with it
    .populate("comment")
    .then(function(dbArticle) {
      // If we were able to succmessfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/articles/id:", function(req,res){
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.listen(3000, function() {
    console.log("localhost:3000");
  });
  