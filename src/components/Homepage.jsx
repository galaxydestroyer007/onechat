import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import { socket } from '../App'
import axios from 'axios'
import Chattile from './Chattile'
import Chatpage from './Chatpage'
import Groupchat from './Groupchat'
const Homepage = () => {
    const {userid}=useContext(logcontext);
    let[chats,setchats]=useState([]);
    let[currentid,setcurrentid]=useState(0);
    let[search,setsearch]=useState([]);
    let[string,setstring]=useState("");
    let[gh,setgh]=useState(false);

    const fetch_chats=async()=>{
       try{
        const result=await axios.get('/api/chat/fetch_chat');
        // a.chat_type,
        //         a.chat_id,
        //         a.name,
        //         b.message,
        //         b.timestamp
        setchats(result.data);
       }catch(err){
         alert(`there was an error :${err.message}`)
       }
    }
    useEffect(()=>{
        fetch_chats();
        socket.on('room-joined',(data)=>{
            setcurrentid(data.room_id);
        })

        return()=>socket.off('room-joined');
    },[]);
    let handleclick=(e,chat_id,type)=>{
        socket.emit('join-room',{id1:userid,roomid:chat_id,type:type});
    }

    const handlechange=async(e)=>{
        setstring(e.target.value);
        try{
             let result=await axios.get(`http://localhost:3000/api/chat/search:${e.target.value}`);
             setsearch(result.data.users);
        }catch(err){
            alert(err.message);
        }
    }

    const handlegh=()=>{
        setgh(true);
        setcurrentid(0);
    }
  return (
    <>
   <div>
    <div>
        <div><input type="search" value={string} onChange={handlechange}></input> <div><button onClick={handlegh}>create group chat</button></div>
        {
            search.length>0 && search.map((val,no)=>(<li key={val.chat_id}>{val.name}</li>))
        }
    </div>

    </div>
     <div>side bar
        {chats.length==0 && <p> start chatting with your friends or strangers !. search for people to talk to</p>}
        {chats.length >0 && chats.map((val,no)=>(<li key={val.chat_id} onClick={(e)=>handleclick(e,val.chat_id,val.chat_type)}><Chattile val={val}/></li>))}
    </div>

    <div>
        chat page
        <div>
            {currentid==0 && <p>click on a chat to start talking</p>}
            {gh && <Groupchat gh={setgh} id={setcurrentid}/>}
            {currentid!=0 && <Chatpage chat_id={currentid}/>}
        </div>
    </div>
   </div>
    </>

  )
}

export default Homepage