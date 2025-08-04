const { body, validationResult } = require("express-validator");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { render, name } = require("ejs");
const path = require('path');


const rules = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required"),

  // password validation
  body("password")
    .notEmpty().withMessage("Password is required"),

    body("confirm_password").notEmpty().withMessage("Please confirm your password")
    .custom((value,{req})=>{
        if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
];



exports.home = (req,res)=>{

    res.render("home",{title : "Home"})

}


exports.signup = async(req,res)=>{


    res.render("signup", {errors:[]})

}

exports.signup = async(req,res)=>{


    res.render("signup", {errors:[]})

}

exports.signup_post = [rules,async(req,res)=>{

    const errors = validationResult(req).array()


    if (errors.length > 0) {
      return res.status(400).render("signup", {
        errors: errors,
      });
    }


    const {username , password} = req.body;

     try {
      const secured_password = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data :{
            username :username,
            password : secured_password 
        }
      })

      res.render("login" , {username : username , errors : []});

    } catch (err) {
      console.error(err);

      if (err.code === "23505") {
        // PostgreSQL unique_violation error code
        errors.push({ msg: "Username already exists" });
      }

      return res.status(400).render("signup", { errors : errors});
    }

}]


exports.login = async(req,res)=>{


    res.render("login", {errors:[],username : ""})

}


exports.upload = (req,res)=>{

    res.render("upload",{id : req.params.id})

    

}

exports.folder_new = (req,res)=>{

    res.render("add_folder")

}

exports.folder_new_post = async (req,res)=>{


    await prisma.folder.create({
        data : {

            name : req.body.name,
            UserID : req.user.id

        }
    })

    res.redirect("/folders")


}

exports.folders = async (req,res)=>{



    const folders = await prisma.folder.findMany(
        {
            where : {
                UserID : req.user.id
            },
            orderBy : {
                id : "asc"
            }
        }
    )
    


    res.render("folders",{folders : folders})

}



exports.folder = async (req,res)=>{


    const files = await prisma.file.findMany(
        {
            where : {
                FolderID : parseInt(req.params.id, 10)
            }
        }
    )

    res.render("folder",{id : req.params.id , files : files})


}


exports.folder_update = async (req,res)=>{


    const folders = await prisma.folder.findMany(
        {
            where : {
                id : parseInt(req.params.id,10)
            }
        }
    )


    res.render("folder_update",{id : folders[0].id , name : folders[0].name})

}


exports.folder_update_post = async (req,res)=>{


    await prisma.folder.update(
       {
        where : {
            id : parseInt(req.params.id,10)
        },
        data : {
            name : req.body.name
        }
       }
    )

    res.redirect("/folders")

}


exports.folder_delete = async (req,res)=>{


    await prisma.folder.delete({
        where : {
            id : parseInt(req.params.id)
        }
    })

    res.redirect("/folders")

}


exports.file = async (req,res)=>{


    const file = await prisma.file.findMany(
        {
            where : {
                id : parseInt(req.params.idFile,10)
            }
        }
    )

    

    res.render("file.ejs",{file : file[0],FolderID : req.params.id})

}


exports.download = async (req,res)=>{

    const file = await prisma.file.findMany({
        where : {
            id : parseInt(req.params.id_file,10)
        }
    })

    res.redirect(file[0].url)

}