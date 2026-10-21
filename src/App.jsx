import { useContext, useEffect, useState } from 'react'
import {io} from 'socket.io-client';
export const socket=io("http://localhost:3000");
import {Route,Routes,Navigate} from 'react-router-dom'
import Homepage from './components/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import { logcontext } from './components/Authcontext';

function App() {
  let{login}=useContext(logcontext);
  return(
    <Routes>
      <Route path='/homepage' element={login ? <Homepage/> :<Navigate to='/'/>}></Route>
      <Route path='/' element={login? (<Homepage/>):(<Login/>)}></Route>
      <Route path='/signup' element={login ? (<Homepage/>):(<Signup/>)}></Route>
    </Routes>
  )
}

export default App
