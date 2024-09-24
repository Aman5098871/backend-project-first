const express = require("express");
const app = express();

const userModal = require("./models/user");
const postModal = require("./models/post");
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { hash } = require("crypto");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "punlic")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});



app.get("/profile", isLoggedIn, async (req, res) => {
  let user =await userModal.findOne({email: req.user.email}).populate('posts')
  console.log(user._id)
  // console.log(user);
 
  res.render("profile" , {user});
});
app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post =await postModal.findOne({ _id: req.params.id }).populate('user')
  if(post.likes.indexOf (req.user.userid)=== -1){
  post.likes.push(req.user.userid)
  }
  else{
  post.likes.splice(post.likes.indexOf (req.user.userid), 1);
  }
  post.save()
  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post =await postModal.findOne({ _id: req.params.id }).populate('user')
  
  res.render("edit" ,{post});
});


app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post =await postModal.findOneAndUpdate({ _id: req.params.id }, {content: req.body.content});
  
  res.redirect("/profile");
});


app.post("/post", isLoggedIn, async (req, res) => {
  let user =await userModal.findOne({email: req.user.email})
  let {content}=req.body
  let post = await postModal.create({
    user: user._id,
    content
  })
  user.posts.push(post._id)
   await user.save()
   res.redirect('/profile')
});

// ==================Register-SET-UP======================

app.post("/register", async (req, res) => {
  let { username, name, email, password, age } = req.body;
  let user = await userModal.findOne({ email });
  if (user) return res.status(500).send("user already Registered");
  bcrypt.genSalt(10, (err, salt) => {
    // console.log(salt)
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModal.create({
        name,
        username,
        age,
        email,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.send("Registerd");
    });
  });
});

// ==================LOGIN-SET-UP======================

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModal.findOne({ email });
  if (!user) return res.status(500).send("Something Went wrong");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

// ==================LOGIN-OUT-SET-UP======================

app.get("/logout", async (req, res) => {
  try {
    // res.clearCookie("token");
    res.cookie("token", "");
    res.redirect("/login");
  } catch (error) {
    console.log(error)
  }
});

// ==================MIDDLE WARE======================

function isLoggedIn (req, res, next) {
  if (req.cookies.token === "") res.redirect('/login')
  else {
    let data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
    next();
  }
}


// function isLoggedIn(req, res, next) {
//   const token = req.cookies.token;
  
//   if (!token) {
//     return res.redirect('/login');
//   }
  
//   try {
//     let data = jwt.verify(token, "secret");
//     req.user = data;
//     next();
//   } catch (error) {
//     return res.redirect('/login');
//   }
// }


// =================CALLING======================


app.listen(3000, (req, res) => {
  console.log("Yes, i am connected on port 3000");
});
