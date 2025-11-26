import React, { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'


const signup = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Fullname: '',
        Email: '',
        Password: ''
    });

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
            const API = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API}/api/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 201) {
                // Handle successful signup
                toast.success('Signup successful! Please login.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } else {
                // Handle signup error
                const errorData = await response.json();
                toast.error(`Signup failed: ${errorData.message}`);
                console.error('Signup error:', errorData);
            }
        }
        catch (error) {
            console.error('Error during signup:', error);
        }
    };

    return (
        <div className='container mt-5' style={{ maxWidth: '500px' }}>
            <div className='flex items-center justify-center text-center mb-4'>
                <h2><i className='fas fa-user-plus me-2'></i>Signup</h2>
                <p>Create your account to start tracking your expenses</p>
            </div>
            <form className='p-4 border rounded shadow' style={{ maxWidth: '400' }} onSubmit={handleSubmit} >
                <div className='mb-3'>
                    <label htmlFor='username' className='form-label'>Username</label>
                    <div className='input-group'>
                        <span className='input-group-text'><i className='fas fa-user'></i></span>
                        {/* <span className='input-group-text'>@</span> */}
                        <input type='text' className='form-control' id='username' name='Fullname' value={formData.Fullname} onChange={handleInputChange} placeholder='Enter Fullname' />

                    </div>

                </div>
                <div className='mb-3'>
                    <label htmlFor='email' className='form-label'>Email</label>
                    <div className='input-group'>
                        <span className='input-group-text'><i className='fas fa-envelope'></i></span>
                        <span className='input-group-text'>@</span>
                        <input type='email' className='form-control' id='email' name='Email' value={formData.Email} onChange={handleInputChange} required placeholder='Enter email' />
                    </div>

                </div>
                <div className='mb-3'>
                    <label htmlFor='password' className='form-label'>Password</label>
                    <div className='input-group'>
                        <span className='input-group-text'><i className='fas fa-lock'></i></span>
                        {/* <span className='input-group-text'>@</span> */}
                        <input type='password' className='form-control' id='password' name='Password' value={formData.Password} onChange={handleInputChange} required placeholder='Enter password' />
                    </div>

                </div>
                <button type='submit' className='btn btn-primary w-100 mt-3'><i className='fas fa-user-plus me-2'></i>Signup</button>
            </form>
            <ToastContainer />
            <title>Signup - Expense Tracker</title>
        <meta name="description" content="Signup - Expense Tracker" />
        </div>
    )
}

export default signup