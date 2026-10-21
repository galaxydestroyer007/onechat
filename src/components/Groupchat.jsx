import axios from 'axios';
import React, { useContext, useState } from 'react'
import { socket } from '../App';
const Groupchat = ({gh,id}) => {
    let {userid}=useContext(logcontext);
    let[string,setstring]=useState("");
    let[result,setresult]=useState([]);
    let[users,setusers]=useState([userid]);
    let handleclick=(e,id)=>{
        if(users.length==4 && !users.includes(id)){
            alert("cannot add more than 4 users at once");
            return;
        }else if(users.length<4 && !users.includes(id)){
            setusers((prev)=>[...prev,id]);
        }else{ 
            setusers((prev)=>(prev.filter(x=>x!=id)))
        }
    }

    let handleSubmit=async()=>{
        try{
            let result=await axios.post("http://localhost:3000/api/chat/create-group",{user:users},{withCredentials:true});
            socket.emit("join-group",{id1:userid,roomid:result.data.groupid,type:'public'});
            gh.setgh(false);
        }catch(err){
            alert(err.message);
        }
    }


    const handlechange=async(e)=>{
        setstring(e.target.value);
        try{
             let result=await axios.get(`http://localhost:3000/api/chat/search:${e.target.value}`);
             setresult(result.data.users);
        }catch(err){
            alert(err.message);
        }
    }
  return (
    <div>

        <input type='search' value={string} onChange={(e)=>handlechange(e)}></input>
        {result.length>0 && <div>{result.map((val,no)=>(
            <div><li key={val.user_id} onclick={(e)=>handleclick(e,val.user_id)}>{val.user_name}</li> <input type="checkbox"></input></div>
        ))}</div>}

        <button onClick={handleSubmit}>create group</button>
    </div>
    
    
  )
}

export default Groupchat