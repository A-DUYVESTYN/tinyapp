const express = require("express"); //Express framework (Routing/Server)
// const cookieParser = require("cookie-parser"); // Parse string to cookie
const cookieSession = require('cookie-session') // cookie-based session middleware.
const morgan = require('morgan') // Logs the requests received
const bcrypt = require("bcryptjs");
const helper = require("./helpers")
///////////////////////////////////////////////////////////
// Configuration
///////////////////////////////////////////////////////////
const app = express(); // create an express server and references it with app
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // The rendering engine will be EJS

///////////////////////////////////////////////////////////
// Middleware
///////////////////////////////////////////////////////////

// body-parser library will convert the request body from a Buffer into string that we can read
app.use(express.urlencoded({ extended: true })); // parse incoming body
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["i am not a crook", "teacup stable cactus"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

///////////////////////////////////////////////////////////
// Databases
///////////////////////////////////////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  aaabbb: {
    longURL: "https://www.example.com",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user3@example.com",
    password: bcrypt.hashSync("1234", 10),
  },
};
///////////////////////////////////////////////////////////
// GET Routes
///////////////////////////////////////////////////////////
app.get("/urls", (req, res) => {
  // send msg and login link if user not logged in
  if (!checkLoginByUserId(req.session.user_id)) {
    return res.send("<html><body><b>Please log in or register to view URLs.</b>\n<div><a href=\"/login\">Login</a></div></body></html>");
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id] // access cookie
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
  // redirect to /login if not logged in
  if (!checkLoginByUserId(req.session.user_id)) {
    return res.redirect(`/login`)
  }
  const templateVars = {
    user: users[req.session.user_id] // access cookie
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // send msg and link if user not logged in
  if (!checkLoginByUserId(req.session.user_id)) {
    return res.send("<html><body><b>Please log in or register to view individual URLs.</b>\n<div><a href=\"/login\">Login</a></div></body></html>");
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body><b>You do not own this individual URL.</b>\n<div><a href=\"/urls\">Back to My URLs</a></div></body></html>");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]  // access cookie
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body>The requested shortened URL does not exist</body></html>\n");
  }
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  // redirect to /urls if logged in
  if (checkLoginByUserId(req.session.user_id)) {
    return res.redirect(`/urls`)
  }
  const templateVars = {
    user: users[req.session.user_id] // access cookie
  };
  res.render(`urls_register`, templateVars)
});

app.get("/login", (req, res) => {
  // redirect to /urls if logged in
  if (checkLoginByUserId(req.session.user_id)) {
    return res.redirect(`/urls`)
  }
  const templateVars = {
    user: users[req.session.user_id] // access cookie
  };
  res.render(`urls_login`, templateVars)
});

///////////////////////////////////////////////////////////
// POST Routes
///////////////////////////////////////////////////////////
app.post("/urls", (req, res) => {
  // respond with message if not logged in
  if (!checkLoginByUserId(req.session.user_id)) {
    return res.send(`<html><body>Please register or log in to create new shortened URLs.</body></html>\n`)
  }
  console.log(req.body); // Log POST request body to console
  randomstr = generateRandomString()
  urlDatabase[randomstr] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  console.log(urlDatabase) // Log url database
  res.redirect(`/urls/${randomstr}`)
});

app.post("/urls/:id/edit", (req, res) => {
  // TODO: refactor this into helper function
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body>The requested shortened URL does not exist</body></html>\n");
  }
  if (!checkLoginByUserId(req.session.user_id)) {
    return res.send(`<html><body>User not logged in</body></html>\n`)
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not own this individual URL.</b>\n</body></html>");
  }
  urlDatabase[req.params.id].longURL = req.body.editURL
  res.redirect(`/urls`)
});

app.post("/urls/:id/delete", (req, res) => {
  // TODO: refactor this into helper function
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body>The requested shortened URL does not exist</body></html>\n");
  }
  if (!checkLoginByUserId(req.session.user_id)) {
    return res.send(`<html><body>User not logged in</body></html>\n`)
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not own this individual URL.</b>\n</body></html>");
  }
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`)
});

app.post("/login", (req, res) => {
  const currentUser = helper.getUserByEmail(req.body["email"], users)
  if (currentUser === null) {
    return res.status(403).send('e-mail cannot be found.')
  }
  if (!bcrypt.compareSync(req.body["password"], users[currentUser].password)) {
    return res.status(403).send('incorrect password')
  }
  req.session.user_id = (users[currentUser].id);
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect(`/login`)
});

app.post("/register", (req, res) => {
  if (req.body["email"] === '') {
    return res.status(400).send('Registration must include a valid email.')
  }
  if (req.body["password"] === '') {
    return res.status(400).send('Registration must include a valid password.')
  }
  if (helper.getUserByEmail(req.body["email"], users) !== null) {
    return res.status(400).send('Email address is already registered.')
  }
  newRandId = generateRandomString()
  users[newRandId] = newRandId
  users[newRandId] = {
    id: newRandId,
    email: req.body["email"],
    password: bcrypt.hashSync(req.body["password"], 10),
  }
  req.session.user_id = ("user_id", users[newRandId].id)
  console.log(users) // log user database to console for debug
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

const generateRandomString = function () {
  let length = 6;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}



const checkLoginByUserId = function (userId) {
  for (const user in users) {
    if (user === userId) {
      return true
    }
  }
  return false
}

const urlsForUser = function (currentUserId) {
  const usersUrls = []
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === currentUserId) {
      usersUrls.push(urlID)
    }
  }
  // create object with user's urls, in database format
  return Object.fromEntries(usersUrls.map(key => [key, urlDatabase[key]]));
}

