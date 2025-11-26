import React from 'react'
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

const AddExpense = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ExpenseDate: '',
        ExpenseItem: '',
        ExpenseCost: ''
    });

    const userId = localStorage.getItem('userId');
    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ExpenseDate: formData.ExpenseDate,
                ExpenseItem: formData.ExpenseItem,
                ExpenseCost: formData.ExpenseCost === '' ? null : Number(formData.ExpenseCost),
                UserId: Number(userId)
            };

            if (!userId || Number.isNaN(Number(userId))) {
                toast.error('User not found, please log in again');
                navigate('/login');
                return;
            }
            const API = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API}/api/add-expense/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 201) {
                toast.success(data.message || 'Expense added successfully');
                setFormData({
                    ExpenseDate: '',
                    ExpenseItem: '',
                    ExpenseCost: ''
                });
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
            // if (!userId || isNaN(Number(userId))) {
            //     toast.error("Invalid User ID!");
            //     return;
            // }
            else {

                toast.error(`Expense addition failed: ${data.message || response.statusText}`);
                console.error('Expense addition error:', data);
            }
        }
        catch (error) {
            console.error('Error during expense addition:', error);
            toast.error('Network error while adding expense');
        }
    };

    return (
        <div className='container flex items-center justify-center' style={{ maxWidth: '600px' , marginTop : '4rem' , padding : '30px 10px' , position : 'relative' , height : '70vh' }}>
            <div className='flex items-center justify-center text-center mb-4'>
                <h2><i className='fas fa-plus-circle me-2'></i>Add Expense</h2>
                <p className='text-muted'>Track your expenses easily</p>
            </div>
            <form className='p-4 border rounded shadow' style={{ maxWidth: '400' }} onSubmit={handleSubmit} >
                <div className='mb-3'>
                    <label htmlFor='expenseDate' className='form-label'>Expense Date</label>
                    <div className='input-group'>
                        <span className='input-group-text'><i className='fas fa-calendar-alt'></i></span>
                        {/* <span className='input-group-text'>@</span> */}
                        <input type='date' className='form-control' id='expenseDate' name='ExpenseDate' value={formData.ExpenseDate} onChange={handleInputChange} required />

                    </div>

                </div>
                <div className='mb-3'>
                    <label htmlFor='expenseItem' className='form-label'>Expense Item</label>
                    <div className='input-group'>
                        <span className='input-group-text'><i className='fas fa-shopping-cart'></i></span>
                        <input type='text' className='form-control' id='expenseItem' name='ExpenseItem' value={formData.ExpenseItem} onChange={handleInputChange} required />
                    </div>

                </div>
                <div className='mb-3'>
                    <label htmlFor='expenseCost' className='form-label'>Expense Cost</label>
                    <div className='input-group'>
                        <span className='input-group-text'><i className='fas fa-dollar-sign'></i></span>
                        {/* <span className='input-group-text'>@</span> */}
                        <input type='number' className='form-control' id='expenseCost' name='ExpenseCost' value={formData.ExpenseCost} onChange={handleInputChange} required />
                    </div>

                </div>
                <button type='submit' className='btn btn-primary w-100 mt-3'><i className='fas fa-user-plus me-2'></i>Add Expense</button>
            </form>
            <ToastContainer />

        <title>Add Expense - Expense Tracker</title>
        <meta name="description" content="Add Expense - Expense Tracker" />
        </div>
    )
}

export default AddExpense
