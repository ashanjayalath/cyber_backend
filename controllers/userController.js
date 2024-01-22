const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const errorMessages = require('../midleware/errorHandler');

module.exports = {
    //Register user
    //POST method
    //Public
    userRegister : async (req,res,next)=>{
        //get the data from request body
        const {name,email,password,phone} = req.body;

        try{
            //Hashed the password
            const hashPassword = await bcrypt.hash(password,10);
            const User = await userModel.create({
                name,
                email,
                password:hashPassword,
                phone
            })
            res.status(200).json({
                _id:User.id,
                name:User.name,
                email:User.email,
                phone:User.phone
            });
        }catch(error){
            res.status(409).json({Error : error,message:`Duplicate ${error.keyValue}`});
            //next(errorMessages(409,error))
        }
    },

    //Login user
    //POST method
    //Public
    userLogin : async(req,res)=>{
        const {email,password} = req.body;
        // if (!email || !password){
        //     res.status(400);
        //     throw new Error('All fields are mandatory!');
        // }
        const User = await userModel.findOne({email});
        if(User && (await bcrypt.compare(password,User.password))){
            const accessToken = jwt.sign({
                user:{
                    name:User.name,
                    email:User.email,
                    id:User.id
                }
            },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn : "1m" }
            );
            res.status(200).json({ accessToken })
        }else{
            res.status(401).json({error : "Email or password not valid"});
        }
    },
    
    //LogOut user
    //POST method
    //Public
    userLogOut : async(req,res)=>{
        try {
            res.setHeader('Clear-Site-Data', '"cookies"');
            res.status(200).json({ message: 'You are logged out!' });
            //const User = await userModel.findByIdAndRemove({_id : req.params.id});
            //res.status(200).json({message : "User Log Out Successfully.."});
        } catch (error) {
            res.status(500).json({message:error.message})
        }

    },
    

    //Update user
    //PUT
    //public
    userUpdate : async (req,res)=>{
        //get the data from request body
        const {name,email,phone,city,age,avatar,id} = req.body;

        try{
            const UserUpdate = await userModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set:{
                        name : req.body.name,
                        email : req.body.email,
                        phone : req.body.phone,
                        city : req.body.city,
                        age : req.body.age,
                        avatar : req.body.avatar
                    }
                },
                {new: true}
                );
                const {password,...bulk} = UserUpdate._doc;
                res.status(200).json(bulk);
        }catch(error){
            res.status(500).json({message:error.message})
        }
    },

    //Update user password
    //PUT
    //public
    userPasswordUpdate : async (req,res)=>{
        //get the data from request body
        const {CurrentPassword,NewPassword,id} = req.body;
        const User = await userModel.findOne({id});
        if(await bcrypt.compare(CurrentPassword,User.password)){
            const hashPassword = await bcrypt.hash(NewPassword,10);
            try{
                const UserPasswordUpdate = await userModel.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set:{
                            password : hashPassword
                        }
                    },
                    {new: true}
                    );
                    res.status(200).json({Message : "Password Updated Successfully..."});
            }catch(error){
                res.status(500).json({message:error.message})
            }
        }else{
            res.status(201).json({message:"Youer password is incorrect"});
        }

        
    },

    
    //Delete user
    //DELETE method
    //Private
    userDelete : async(req,res)=>{
         try{
            const userDelete = await userModel.findOneAndDelete({_id: req.params.id});
            res.status(200).json({message : "User Delete Successfully.."});
         }catch(error){
             res.status(500).json({message:error.message})
             //res.redirect("/user/login");
         }
    }
};
