const express = require("express");
const cookieParser = require("cookie-parser");

/////////////////////////////////////////////////////////////
// Configuration
/////////////////////////////////////////////////////////////
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////

// body-parser library will convert the request body from a Buffer into string that we can read
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

/////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"] // access cookie
  };
  res.render('urls_index', templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] // access cookie
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]  // access cookie
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log POST request body to console
  randomstr = generateRandomString()
  urlDatabase[randomstr] = req.body.longURL
  console.log(urlDatabase) // Log url database
  res.redirect(`/urls/${randomstr}`)
});

app.post("/urls/:id/edit", (req, res) => {
  console.log(req.body); // Log POST request body to console
  urlDatabase[req.params.id] = req.body.editURL
  console.log(urlDatabase) // Log url database
  res.redirect(`/urls`)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  console.log (urlDatabase)
  res.redirect(`/urls`)
});

app.post("/login", (req, res) => {
  console.log(req.body) //log username to console for debug
  res.cookie("username", req.body["username"])
  res.redirect(`/urls`)
  console.log(req.cookies["username"]) // this logs the previous username for some reason.. res.cookie is async??
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect(`/urls`)
});

/////////////////////////////////////////////////////////////
// Server Listener
/////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
/////////////////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////////////////

const generateRandomString = function() {
  let length = 6;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
 return result;
}