import React , {useRef , useState} from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const navbar = () => {
    const navigate = useNavigate();
    const userID = localStorage.getItem('userId');
    const handlelogout = () => {
        localStorage.removeItem('userId');
        navigate('/login');
        toast.warn('Logged out successfully');
    }

    const collapseRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        if (!collapseRef.current) return;
        collapseRef.current.classList.toggle('show');
        setIsOpen(prev => !prev);
    };

    const closeNavbar = () => {
        if (!collapseRef.current) return;
        if (collapseRef.current.classList.contains('show')) {
            collapseRef.current.classList.remove('show');
            setIsOpen(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
                <div className="container-fluid px-5 py-3">
                    <Link className="navbar-brand px-3" to="/" onClick={closeNavbar}><i className='fas fa-wallet me-2'></i>Daily Expense Tracker</Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        aria-controls="navbarNav"
                        aria-expanded={isOpen ? "true" : "false"}
                        aria-label="Toggle navigation"
                        onClick={toggleNavbar}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav" ref={collapseRef}>
                        <ul className="navbar-nav gap-3 ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/" onClick={closeNavbar}>Home</Link>
                            </li>
                            {userID ? (     
        
                                                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/dashboard" onClick={closeNavbar}><i className='fas fa-tachometer-alt me-2'></i>Dashboard</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/add-expense" onClick={closeNavbar}><i className='fas fa-plus me-1'></i>Add Expense</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/manage-expense" onClick={closeNavbar}><i className='fas fa-file-alt me-1'></i>Manage Expense</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/expense-report" onClick={closeNavbar}><i className='fas fa-key me-1'></i>Expense Report</Link>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link btn btn-link" onClick={() => { handlelogout(); closeNavbar(); }}><i className='fas fa-sign-out-alt me-1'></i>Logout</button>
                                    </li>
                                </>
                            ) : (
                       
                                                                    <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/signup" onClick={closeNavbar}><i className='fas fa-user-plus me-2'></i>Signup</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login" onClick={closeNavbar}><i className='fas fa-sign-in-alt me-2'></i>Login</Link>
                                    </li>
                                </>
                            )};
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default navbar