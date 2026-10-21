let express=require('express');
let{login,signup,authprovider, middleware}=require('../controllers/auth.js');
export const authrouter=express.Router();

authrouter.post('/signup',signup);
authrouter.get('/login',login);
authrouter.get('/authprovider',authprovider);

