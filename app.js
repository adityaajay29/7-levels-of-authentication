//jshint esversion:6

// required modules
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const encrypt = require("mongoose-encryption");

// pacage for hash function
// const md5 = require("md5");

// we will use bcrypt for hashing instead of md5, as it is more secure
const bcrypt = require("bcrypt");

// defining no of salt rounds
const saltRounds = 10;

dotenv.config();

// creating a secret string to encrypt our database, in .env
const SECRET = process.env.SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

// creating new express app
const app = express();

// use public folder to access static files
app.use(express.static("public"));
// use views folder for ejs files
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));

// connect DB
mongoose.connect(MONGODB_URI, {useNewUrlParser : true});

// new schma for users 
const userSchema = new mongoose.Schema({
    email : String, 
    password : String
});

// adding encrypt as a plugin for the schema, which uses secret 
// but, we ony want to encrypt password
// encryption is done when we save() a doc
// decryption is done when we find() a doc

// userSchema.plugin(encrypt, {secret : SECRET, encryptedFields: ["password"]});

// new collection named users
const User = new mongoose.model("User", userSchema);


app.get("/", function(req ,res){
    res.render("home");
});

app.get("/login", function(req, res)
{
    res.render("login");
})

app.get("/register", function(req, res)
{
    res.render("register");
});

// get data from registration form and add that user to database
// then render the secrets page
app.post("/register", function(req, res)
{
    const username = req.body.username;
    const password = req.body.password;

    // using bcrypt to hash the password
    // whatever hash is generated after salting, use that for password
    bcrypt.hash(password, saltRounds, function(err, hash) {
        const newUser = new User({
            email : username,
            password : hash
        });
        newUser.save(function(err)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render("secrets");
            }
        });
    });
    
    // we will hash the password
    // const password = md5(req.body.password);
});

// get data from login form and check if the user exists or not
// if yes, then check if the password matches with the database or not
// if yes, then render the secrets page
app.post("/login", function(req, res)
{
    const username = req.body.username;

    // we use hashed password to find the password match
    const password = req.body.password;
    
    User.findOne({email : username}, function(err, foundUser)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(foundUser)
            {
                // using bcrypt to cmpare the password with hashed password, and find it
                // we compare the password with the hashed password stored on db
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    {
                        if(result === true)
                        res.render("secrets");
                    } 
                });   
            }
            else
            console.log("no user found");
        }
    });
});

app.listen(PORT, function()
{
    console.log("server started successfully");
});