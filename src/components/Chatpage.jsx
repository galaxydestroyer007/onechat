import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useContext } from 'react';
import { socket } from '../App';
const Chatpage = ({chat_id}) => {
    let[text,settext]=useState([]);
    let[message,setmessage]=useState("");
    let {userid}=useContext(logcontext);
    const fetch_message=async()=>{
        if(chat_id==0){
            return;
        }
       try{
         const result=await axios.get(`http://localhost:3000/api/chat/getmessage/:${chat_id}`);
         settext(result.data.message);
       }catch(err){
        alert(err.message);
       }
    }
    useEffect(()=>{
        fetch_message();
    },[chat_id]);

    useEffect(()=>{
        socket.on("recieve-message",(data)=>{
            settext((prev)=>[...prev,data]);
        })

        return ()=>{socket.off("recieve-message");}

    },[])

    let handleclick=()=>{
        try{
            socket.emit("send-message",{chat_id:chat_id,user_id:userid,message:message});
        }catch(err){
            alert(err.message);
        }
    }

    if(chat_id==0){
        return <>start chatting with your friends</>
    }
  return (
    <>
    <div>   
        <div>
            {text.length>0 &&  <div style={{display:'flex',flexDirection:'column-reverse',alignItems:"center"}}>{
            text.map((val,no)=>(<div key={no} style={val.userid==userid ? ({alignSelf:"end",}):({alignSelf:"start"})}>{val.message}</div>))
            }</div>}

            {text.length==0 && <p>be the one to break the ice!</p>}
        </div>
        <div>
            <div>
                <textarea value={message} onChange={(e)=>setmessage(e.target.value)}></textarea>
                <button onClick={handleclick}>send</button>
            </div>
        </div>
    </div>
    </>
  )
}

export default Chatpage