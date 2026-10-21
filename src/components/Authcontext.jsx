import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
export let logcontext=createContext();
const Authcontext = ({children}) => {
    let[login,setlogin]=useState(false);
    let[userid,setuserid]=useState();
    let handle_check=async()=>{
        try{
            let result=await axios.get('http://localhost:3000/api/chat/authprovider');
            setlogin(result.data.login);
            setuserid(result.data.userid);
        }catch(err){
            alert(err.message);
        }
    }
    useEffect(()=>{
      handle_check();
    },[])
  return (
    <logcontext.Provider value={{login,userid}}>
      {children}
    </logcontext.Provider>
  )
}

export default Authcontext;