import React , {useState} from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

const login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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
            const response = await fetch(`${API}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.status === 201) {
                // Handle successful signup
                toast.success('Login successful! Redirecting to home page.');
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userEmail', data.userEmail);
                // localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.userName);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);

            } else {
                // Handle signup error
                const errorData = await response.json();
                toast.error(`Login failed: ${errorData.message}`);
                console.error('Login error:', errorData);
            }
        }
        catch (error) {
            console.error('Error during login:', error);
        }
    };
    return (
        <div className='container mt-5' style={{ maxWidth: '500px' }}>
            <div className='flex items-center justify-center text-center mb-4'>
                <h2><i className='fas fa-sign-in-alt me-2'></i>Login</h2>
                <p>Login to start access & tracking your Expense Dashboard</p>
            </div>
            <form className='p-4 border rounded shadow' style={{ maxWidth: '400' }} onSubmit={handleSubmit} >
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
                        <input type='password' className='form-control' id='password' name='Password' value={formData.Password} onChange={handleInputChange} required placeholder='Enter password' />
                    </div>
                </div>

                <button type='submit' className='btn btn-primary w-100 mt-3'><i className='fas fa-sign-in-alt me-2'></i>Login</button>
            </form>
            <ToastContainer />
            <title>Login - Expense Tracker</title>
        <meta name="description" content="Login - Expense Tracker" />
        </div>
    )
}

export default login