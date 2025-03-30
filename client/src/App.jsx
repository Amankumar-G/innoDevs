import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button, Switch } from '@mui/material'
import Send from "@mui/icons-material/Send" 
import { BrowserRouter,Routes,Route, Navigate } from 'react-router-dom'
import Footer from './components/Footer/Footer.jsx'
import Header from './components/Header/Header.jsx'

import { UserProvider, useUser } from './context/userContext.jsx'
import SignIn from './components/Signin.jsx'
import Dashboard from './components/Dashboard.jsx'
import TestCases from './components/TestCases.jsx'
import TestAiRecomandation from './components/TestAiRecomandation.jsx'
import Deployement from './components/Deployement.jsx'
import { GenerateProvider } from './context/GenerateTest.jsx'


function AppRoutes() {
  const [dark, setDark] = useState(false);
  const {user,setUser} = useUser();

  useEffect(()=>{
    //  axios profile
    // setUser profile
    console.log(user);
    // setDark(true);
  },[])

  return (
    <div className="dark"> 
    {user? (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/testcase" element={<TestCases />} />
            <Route path="/testairecomandation" element={<TestAiRecomandation />} />
            <Route path="/deployement" element={<Deployement />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </>
      ) : (
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  )
}


function App(){
  return(
    // provide context here
    <GenerateProvider>
    <UserProvider>
    <BrowserRouter>
          <AppRoutes></AppRoutes>
     </BrowserRouter>
    </UserProvider>
    </GenerateProvider>
  )

}

export default App
