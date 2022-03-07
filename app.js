const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const lessonFaceService = require("./lib/lessonFaceService");
const formService = require("./lib/formService");

let app = express();

// Set up the body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Set up cookie parser and sessions
const COOKIE_SECRET = "exampleSecret"; // My secret to secure cookies
app.use(require("cookie-parser")(COOKIE_SECRET)); // Parse incoming cookies

// Set up session for the user, based on cookies
app.use(
  session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// set up handlebars view engine
let handlebars = require("express-handlebars").create({
  defaultLayout: "main",
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/public"));

// Display the login prompt
app.get("/login", function (req, res) {
  res.render("login");
});

// Handle the login action
app.post("/login", function (req, res) {
  req.session.user = req.body.username; // Set the username
  res.redirect("/");
});

app.get("/", function (req, res) {
	const instruments = lessonFaceService.getInstruments();
  if (req.session.user) {
    res.render("home", {
      user: req.session.user,
	  instruments: instruments
    });

    // Otherwise ask them to log in again
  } else {
    res.render("login", {
      error: "Please log in first.",
    });
  }
});

//list
app.get("/lessons/list", function (req, res) {
    res.render("list", {
      
    });
});

//lessons
app.get("/lessons/:instrument", function (req, res) {
	const instructors = lessonFaceService.getInstructorByInstrument(req.params.instrument);
	res.render("lessons", {
		user: req.session.user,
		instrument: req.params.instrument,
		instructors: instructors
	});
});

//instructors
app.get("/lessons/schedule/:id", function (req, res) {
  const instructor = lessonFaceService.getInstructorById(req.params.id);
  
  //const save = lessonFaceService.saveToJson();
  	res.render("schedule", {
		instructor: instructor,
    save: save
	});
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
