

const path = require("node:path");
const express = require("express")
const global = require("./global")
const app = express();
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-local");
const LocalStrategy = require('passport-local').Strategy;
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const expressSession = require('express-session');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const multer  = require('multer')
const fs = require("fs");


const { upload } = require('./cloudinary');




app.set("views", path.join(__dirname, "views")); 
app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: false }));





app.use(
  expressSession({
    store: new PrismaSessionStore(new PrismaClient(), { //store in db
      checkPeriod: 120000,
      dbRecordIdIsSessionId: true,
    }),
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 604800000 },
  })
);
app.use(passport.session());


passport.use( 

	  new LocalStrategy(async (username, password, done) => { 
    try {

      const  resault = await prisma.user.findMany({
        where : {username : username}
      })

      const user = resault[0]

      const match = await bcrypt.compare(password, user.password);
      
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user); 
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => { 

  done(null, user.id);
});

//deserializeUser

passport.deserializeUser(async (id, done) => {
  try {
    const resault = await prisma.user.findMany({
        where : {id : id}
    })

    const user = resault[0]
   

    done(null, user); //attaches  user object to (req.user)
  } catch(err) {
    done(err);
  }
});

app.use((req, res, next) => {

 res.locals.currentUser = req.user; 

 
 next();

});


app.get("/",global.home)

app.get("/signup",global.signup)

app.post("/signup",global.signup_post)

app.get("/login",global.login)

app.post("/login",
    passport.authenticate("local",
        {
            successRedirect : "/",
            failureRedirect : "login"
        }
        
    )
)

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


app.get("/folder/:id/upload",global.upload)

app.post("/folder/:id/upload",upload.single("file"), async (req,res,next)=>{

  console.log("File:", req.file);
    await prisma.file.create({
        data : {
            originalName : req.file.originalname,
            filename : req.file.originalname,
            FolderID : parseInt(req.params.id,10),
            size : req.file.size,
            url : req.file.path,

        }
    })
    
    res.redirect(`/folder/${req.params.id}`)

})


app.get("/folders",global.folders)

app.get("/folder/new",global.folder_new)

app.post("/folder/new",global.folder_new_post)

app.get("/folder/:id",global.folder)


app.get("/folder/:id/update",global.folder_update)

app.post("/folder/:id/update",global.folder_update_post)

app.post("/folder/:id/delete",global.folder_delete)

app.get("/folder/:id/file/:idFile",global.file)

app.post("/folder/:id/file/:id_file/download",global.download)

app.listen("3000",()=>{
    console.log("listenning")
})