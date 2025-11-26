import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const API = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API}/api`;

const ManageExpense = () => {

    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ ExpenseItem: '', ExpenseCost: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        fetchExpenses(userId);

    }, [userId, navigate]);


    const fetchExpenses = async (userId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/manage-expense/${userId}/`);
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                const nextExpenses = Array.isArray(data)
                    ? data
                    : data?.expenses || [];
                setExpenses(nextExpenses);
            } else {
                const msg = (data && data.message) ? data.message : response.statusText;
                toast.error(`Failed to fetch expenses: ${msg}`);
            }

        } catch (error) {
            toast.error(`An error occurred: ${error.message}`);
            console.error('Fetch expenses error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (expense) => {
        setEditingId(expense.id);
        setEditForm({
            ExpenseItem: expense.ExpenseItem || '',
            ExpenseCost: expense.ExpenseCost ?? ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ ExpenseItem: '', ExpenseCost: '' });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const saveExpense = async () => {
        if (!editingId) return;

        if (!editForm.ExpenseItem.trim()) {
            toast.error('Expense item is required');
            return;
        }

        if (editForm.ExpenseCost === '' || Number(editForm.ExpenseCost) < 0) {
            toast.error('Expense cost must be zero or greater');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${editingId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ExpenseItem: editForm.ExpenseItem.trim(),
                    ExpenseCost: Number(editForm.ExpenseCost)
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                toast.success(data?.message || 'Expense updated');
                cancelEdit();
                fetchExpenses(userId);
            } else {
                toast.error(data?.message || 'Unable to update expense');
            }
        } catch (error) {
            console.error('Update expense error:', error);
            toast.error('Network error while updating expense');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteExpense = async (expenseId) => {
        const confirmDelete = window.confirm('Delete this expense? This cannot be undone.');
        if (!confirmDelete) return;

        setDeletingId(expenseId);
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/`, {
                method: 'DELETE'
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                toast.success(data?.message || 'Expense deleted');
                setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
            } else {
                toast.error(data?.message || 'Unable to delete expense');
            }
        } catch (error) {
            console.error('Delete expense error:', error);
            toast.error('Network error while deleting expense');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString();
    };

    const renderActions = (expense) => {
        if (editingId === expense.id) {
            return (
                <>
                    <button
                        className='btn btn-sm btn-success me-2'
                        onClick={saveExpense}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className='btn btn-sm btn-secondary' onClick={cancelEdit}>
                        Cancel
                    </button>
                </>
            );
        }

        return (
            <>
                <button
                    className='btn btn-sm btn-primary me-2'
                    onClick={() => startEdit(expense)}
                >
                    <i className='fas fa-edit'></i>
                </button>
                <button
                    className='btn btn-sm btn-danger'
                    onClick={() => deleteExpense(expense.id)}
                    disabled={deletingId === expense.id}
                >
                    {deletingId === expense.id ? 'Deleting...' : <i className='fas fa-trash-alt'></i>}
                </button>
            </>
        );
    };

    return (
        <div className='container py-4 w-full flex items-center justify-center' style={{marginTop :'5rem' , height : 'auto'}}>
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4'>
                <div>
                    <h2 className='fw-bold mb-1'><i className='fas fa-tasks me-2'></i>Manage Expenses</h2>
                    <p className='text-muted mb-0'>Edit or delete any entry in your ledger.</p>
                </div>
                <button
                    type='button'
                    className='btn btn-outline-primary'
                    onClick={() => navigate('/add-expense')}
                >
                    <i className='fas fa-plus-circle me-2'></i>Add new expense
                </button>
            </div>
            <div className='table-responsive'>
                <table className='table table-striped table-bordered rounded shadow'>
                    <thead className='table-dark text-center'>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Item</th>
                            <th>Cost</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className='text-center py-4'>Loading...</td>
                            </tr>
                        ) : expenses.length ? (
                            expenses.map((expense, index) => (
                                <tr key={expense.id} className='text-center align-middle'>
                                    <td>{index + 1}</td>
                                    <td>{formatDate(expense.ExpenseDate)}</td>
                                    <td className='text-start'>
                                        {editingId === expense.id ? (
                                            <input
                                                type='text'
                                                className='form-control form-control-sm'
                                                name='ExpenseItem'
                                                value={editForm.ExpenseItem}
                                                onChange={handleEditChange}
                                            />
                                        ) : (
                                            expense.ExpenseItem
                                        )}
                                    </td>
                                    <td>
                                        {editingId === expense.id ? (
                                            <input
                                                type='number'
                                                className='form-control form-control-sm'
                                                name='ExpenseCost'
                                                value={editForm.ExpenseCost}
                                                onChange={handleEditChange}
                                                min="0"
                                            />
                                        ) : (
                                            expense.ExpenseCost
                                        )}
                                    </td>
                                    <td>{renderActions(expense)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className='text-center'>No expenses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ToastContainer position="bottom-center" />
            <title>Manage Expenses - Expense Tracker</title>
        <meta name="description" content="Manage Expenses - Expense Tracker" />
        </div>
    )
}

export default ManageExpense