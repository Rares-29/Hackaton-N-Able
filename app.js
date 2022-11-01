const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const User = require(__dirname + "/database.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const passport = require("passport");
const initializePassport = require("./passport-configure");
initializePassport(passport);
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = "mongodb://localhost:27017/greenlight";


const sessionStore = new MongoStore({
    mongoUrl:url,
    collection:"sessions"
  })
  
  
   app.use(session({
     secret: "This is the secret, bro",
     resave: false,
     saveUninitialized: true,
     store:sessionStore,
     })
   );
  
   app.use(passport.initialize());
   app.use(passport.session());
  
var profile = false;
app.get("/", (req, res) => {
    if(req.isAuthenticated()) profile = true;
    else profile = false;
    res.render("index", {profile: profile});
})


app.get("/register", (req, res) => {
    res.render("register");

})

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmation = req.body.confirmation;
    console.log(req.body);
    User.findOne({username: username}, (err, user) => {
        if(!err) {
            if (user) res.redirect("/register");
            else
                {
                    if (password !== confirmation) {
                        res.redirect("/register");
                    }
                    else {
                        // if(req.isAuthenticated())
                        // console.log(req.user);
                    bcrypt.hash(password, saltRounds, function(err, hash) {
                        if (!err)
                        {
                            const user = new User({
                                username: username,
                                password: hash, 
                                points: 0,
                                rec: 0,
                                off: false
                            })
                            user.save();
                        }
                    })
                    res.redirect("/login");
                    }

                }
        }
    })
})

app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
});

app.get("/profile", (req,res) => {
    if(req.isAuthenticated()) 
    {
        let off = "nu";
        if (req.user.rec) off = "da";
        res.render("profile", {user: req.user.username,  points: req.user.points, reciclari: req.user.rec, off: off});
    }
    else res.redirect("/login");
    
})

app.get("/shop", (req, res) => {
    if(req.isAuthenticated())
    {
    let points = req.user.points;
    console.log(typeof(points));
    res.render("shop", {points: points});
    }
    else res.redirect("/login");
})



app.post("/shop", async (req, res) => {
    const kg = parseInt(req.body.kg);
    let Points = 0;
    
    User.findOne({username: req.user.username}, (err, user) => {
        if (!err)
            {
              user.points = user.points + kg;
              user.rec = user.rec + 1;
              Points = user.points;
              user.save();
              res.render("shop", {points: Points});
            }
    })
})

app.get("/login", (req, res) => {
    
    res.render("login");
})

app.post("/login", passport.authenticate("local", {
    successRedirect:"/profile",
    failureRedirect:"/login"
  }))



app.listen(3000, () => {
    console.log("We are listening to the port: 3000");
})

app.get("/bought", (req, res) =>{
 
    if (req.user.points >= 50)
    {
        User.findOne({username: req.user.username}, (err, user) => {
            if (!err)
                {
                  user.points = user.points - 50;
                  user.off = true;
                  user.save();
                }
        })
    code = Math.abs(Math.floor(Math.random() * 1000000000)).toString(16);
    res.render("bought", {code: code});
    }
 
})
