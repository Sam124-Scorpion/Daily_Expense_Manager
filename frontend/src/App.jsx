import React from 'react'
import Signup from './components/signup'
import Login from './components/login'
import Home from './components/home'
import Navbar from './components/navbar'
import Dashboard from './components/dashboard'
import AddExpense from './components/addexpense'
import ManageExpense from './components/manageexpense'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ExpenseReport from './components/expensereport'

const App = () => {
  return (
    <>
      <div className='App' style={{ display: 'flex', height: 'auto', width: '100vw', backgroundColor: '#c5c7c9ff' , marginTop : '5rem' , minHeight : '100vh'}}>
        <BrowserRouter>
        <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/add-expense' element={<AddExpense />} />
            <Route path='/manage-expense' element={<ManageExpense />} />
            <Route path='/expense-report' element={<ExpenseReport />} />
          </Routes>
        </BrowserRouter>
      </div>

    </>
  )
}

export default App