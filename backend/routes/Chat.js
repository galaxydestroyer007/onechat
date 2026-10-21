import { middleware } from '../controllers/auth.js';

let express=require('express');
let {fetch_chat,search,fetch_messages,create_group}=require('../controllers/chat.js')
export let chatrouter=express.Router();
chatrouter.get('/fetch_chat',middleware,fetch_chat);
chatrouter.get('/search',middleware,search);
chatrouter.get('/fetch_messages',middleware,fetch_messages);
chatrouter.post('/create_group',middleware,create_group);
