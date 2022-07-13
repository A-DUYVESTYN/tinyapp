const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require('morgan')
///////////////////////////////////////////////////////////
// Configuration
///////////////////////////////////////////////////////////
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
///////////////////////////////////////////////////////////
// Databases
///////////////////////////////////////////////////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

///////////////////////////////////////////////////////////
// Middleware
///////////////////////////////////////////////////////////

// body-parser library will convert the request body from a Buffer into string that we can read
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan('dev'));

///////////////////////////////////////////////////////////
// GET Routes
///////////////////////////////////////////////////////////
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]] // access cookie
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
    user: users[req.cookies["user_id"]] // access cookie
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]  // access cookie
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get("/register", (req, res) => {

  console.log(req.cookies["user_id"])
  const templateVars = { 
    user: users[req.cookies["user_id"]] // access cookie
  };
  console.log(templateVars)
  res.render(`urls_register`, templateVars)
});

app.get("/login", (req, res) => {

  const templateVars = { 
    user: users[req.cookies["user_id"]] // access cookie
  };
  res.render(`urls_login`, templateVars)
});

///////////////////////////////////////////////////////////
// POST Routes
///////////////////////////////////////////////////////////
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
  const currentUser = userLookupByEmail(req.body["email"])
  if (currentUser === null) {
    res.status(403).send('e-mail cannot be found.')
    return
  } else if (users[currentUser].password !==  req.body["password"]) {
    res.status(403).send('incorrect e-mail or password')
    return
  } 
  res.cookie("user_id", users[currentUser].id)  
  console.log("cookie:", req.cookies["user_id"]) // this returns undefined??
  res.redirect(`/urls`)
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});

app.post("/register", (req, res) => {
  if (req.body["email"] === '') {
    res.status(400).send('Registration must include a valid email.')
    console.log(users)
    return
  } else if (req.body["password"] === '') {
    res.status(400).send('Registration must include a valid password.')
    console.log(users)
    return
  } else if (userLookupByEmail(req.body["email"]) !== null) {
    res.status(400).send('This email address is already registered.')
    console.log(users)
    return
  }
  newRandId = generateRandomString()
  users[newRandId] = newRandId
  users[newRandId] = {
    id: newRandId,
    email: req.body["email"],
    password: req.body["password"],
  }
  res.cookie("user_id", users[newRandId].id)
  console.log(users) //log user database to console for debug
  res.redirect(`/urls`)
});

///////////////////////////////////////////////////////////
// Server Listener
///////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
///////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////

const generateRandomString = function() {
  let length = 6;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
 return result;
}

const userLookupByEmail = function(findThisEmail) {
  for (const user in users) {
    if (users[user].email === findThisEmail) {
      return user
    }
  }
  return null
}