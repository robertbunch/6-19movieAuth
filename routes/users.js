var express = require('express');
var router = express.Router();
const db = require('../db');

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

  const insertUserQuery = `INSERT INTO users (username,email,password)
    VALUES
    ($1,$2,$3)
    returning id`
  db.one(insertUserQuery,[username,email,password]).then((resp)=>{
    res.json({
      msg: resp
    })
  })

});

module.exports = router;
