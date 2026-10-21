// login , signup,signout
const express=require('express');
const pool=require('../db.js');
const bycrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
let secret="h21434lkncsidvneregjr";
export const login=async(req,res)=>{
    let{username,password}=req.body;
    if(!username || ! password || username.length<3 || password.length<3){
        return res.json("enter a valid username and password");
    }
    try{
        const r=await pool.query("select * from user where username=$1",[username]);
        if(r.rows.length==0){
            return res.json("account does not exist try again");
        }
        const hashsed=result.rows[0].password;
        let check=await bycrypt.compare(password,hashsed);
        if(!check){
            return res.json("the password entered is wrong");
        }

        let token=jwt.sign({id:r.rows[0].id},secret,{expiresIn:'24h'});
        res.cookie('token',token,{
            httpOnly:true,
            maxAge:24*60*60*60,
        })

        return res.json("logged in sucessfully");
    }catch(err){

        return res.json(`login unsucessfull due to errors ${err.message}`)

    }
}

export const signup=async(req,res)=>{
    let{email,password,username,name}=req.body;
    if(!email || password || username || name || password.length<5 || username.length<5|| name.length<5){
        return res.json("enter  valid details");
    }
    try{
        const result=await pool.query("select exists( select 1  from users where username=$1 or email=$2)",[username,email]);
        if(result.rows[0].exists){
            return res.json('account already exits! login');
        }
        const hashed=bycrypt.hash(password,10);
        const r=await pool.query("insert into users (email,name,username,password) values ($1,$2,$3,$4)",[email,name,username,hashed]);
        return res.json("profile created sucessfully! pls login");
    }catch(err){

        return res.json(`there was an error ${err.message}`);

    }
}

export const middleware=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.json({message:"not signed in",status:false});
    }
    try{
        let dec=jwt.verify(token,secret);
        req.user={id:dec.id};
        next();

    }catch(err){
        return res.json({message:`${err.message}`,status:false});
    }
}

export const authprovider=async(req,res)=>{
    const token=req.cookies.token;
    if(!token){
        return res.json({message:"the user is not signed in", login:false, userid:"null"});
    }
    try{
        let dec=await jwt.verify(token,secret);
        return res.json({message:"the user is signed in", login:true, userid:dec.id});
    }catch(err){
        return  res.status(500).json({message:`the was an error ${err.message}`, login:false, userid:"null"});
    }
}