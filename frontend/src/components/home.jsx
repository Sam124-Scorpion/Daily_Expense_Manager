import React from 'react'
import {Link} from 'react-router-dom'

const home = () => {

  const userId = localStorage.getItem('userId');



  return (
    <div className='conatainer text-center' style={{display : 'flex' , justifyContent : 'center' , alignItems : 'center' , flexDirection : 'column' , height : '100vh',width : '100%' ,position : 'fixed'}}>
      <h1>Welcome to <span className='text-primary'>Daily Expense Tracker</span></h1>
      <p>Track your daily expense easily and efficiently</p>

    <div className='mt-3'>
   {userId ? (
        <Link to={'/dashboard'} className='btn btn-warning mx-2'>
        <i className='fas fa-tachometer-alt me-2'></i>Go to Dashboard</Link>
 
         ) : (
          <>
        <Link to={'/signup'} className='btn btn-primary mx-2'>
        <i className='fas fa-user-plus me-2'></i>Signup</Link>
        
        <Link to={'/login'} className='btn btn-success mx-2'>
        <i className='fas fa-sign-in-alt me-2'></i>Login</Link>
        </>
      )}
 
      

    </div>
    <title>Home - Expense Tracker</title>
    <meta name="description" content="Home - Expense Tracker" />

    </div>
  )
}

export default home