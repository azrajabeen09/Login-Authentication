const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const SECRET_KEY = process.env.SECRET_KEY;

const users = [];

app.get("/", (req,res)=>{
res.send("Running backend");
});

// Middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    console.log("TOKEN:", token); // DEBUG

    if (!token) {
        return res.send("Unauthorized access!");
    }
    try {
        jwt.verify(token, SECRET_KEY);
        next();
    } catch (err) {
        return res.redirect("/login");
    }
};

app.get("/project", authMiddleware, (req, res) => {
    const projects = [
    {name: "Calculator",   link: "https://calculator-orpin-beta.vercel.app/"},
    {name: "Tribute Page", link: "https://tribute-page-ten-coral.vercel.app/" },
    {name: "Todo App",    link: "https://todo-app-tau-eight-64.vercel.app/"},
    {name: "Login Authentication",link: ""}
];
    res.render("project", { projects });
});
app.get("/register", (req,res)=>{
    res.render("register");
})
app.get("/login", (req,res)=>{
    res.render("login");
})

app.post("/register", async(req,res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.render("register", {error:"All fields are required"});
    }
    const hashPass = await bcrypt.hash(password, 10);
    console.log({Email: email, Password: hashPass});
    users.push({name, email,password:hashPass });
    res.redirect("/login");
})
app.post("/login", async(req,res)=>{
    const {email, password} = req.body;
     if(!email || !password){
        return res.render("login", {error:"All fields are required"});
    }
   const user = users.find(u => u.email === email);    
   if(!user){
        return res.send("User not found!");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.send("Invalid credentials");
    }

// Create JWT 
    const token = jwt.sign(
        {email: user.email},
        SECRET_KEY,
        {expiresIn: "2h"}
    );
    // Store in cookie
    res.cookie("token", token,{httpOnly:true} )
    
    res.redirect("/project");
});
app.get("/logout", (req,res) =>{
    res.clearCookie("token");
    res.redirect("/login")
})

module.exports = app;
