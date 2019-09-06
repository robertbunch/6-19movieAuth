var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const expressSession = require('express-session');

const sessionOptions = {
  secret: "i3rlejofdiaug;lsad", //unlike me, DONT share this with the world
  resave: false,
  saveUninitialized: false
}

router.use(expressSession(sessionOptions));

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// the users is already at /users/ or they wouldnt have
// gotten to this peice of middleware
router.post('/registerProcess',(req, res, next)=>{

  // const {username,email,password,password2} = req.body;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  const checkUserExistsQuery = `
    SELECT * FROM users WHERE username = $1 OR email = $2
  `
    db.any(checkUserExistsQuery,[username, email]).then((results)=>{
      if(results.length > 0){
        // this user already exists
        res.redirect('/login?msg=userexists')
      }else{
        // new user. insert
        insertUser();
      }
    })

  function insertUser(){
    const insertUserQuery = `INSERT INTO users (username,email,password)
      VALUES
      ($1,$2,$3)
      returning id`
    const hash = bcrypt.hashSync(password,10);
    db.one(insertUserQuery,[username,email,hash]).then((resp)=>{
      res.json({
        msg: resp
      })
    })
  }
});

router.post('/loginProcess',(req, res)=>{
  // res.json(req.body);
  const checkUserQuery = `
    SELECT * FROM users WHERE username=$1
  `;
  const checkUser = db.one(checkUserQuery,[req.body.username])
  
  checkUser.then((results)=>{
    // user exists. Check gthe pass
    const correctPass = bcrypt.compareSync(req.body.password,results.password)
    if(correctPass){
      // this is a valid user/pass
      req.session.username = results.username;
      req.session.loggedin = true;
      req.session.email = results.email;
      res.redirect('/');
  // -NOTE: every single http request (route) is a completely
  // new request. 
  // Cookies: Stores data in the browser, with a key on the server
  // every single page request the entire cookie is sent to the server
  // Sessions: Stores data on the server, with a key (cookie) on the browser

    }else{
      // these aren't the droids were looking for
      res.redirect('/login?msg=badPass')
    }
    // res.json(results);
  })

  checkUser.catch((error)=>{
    res.json({
      msg: "userDoesNotExist"
    })
  })
})

module.exports = router;
