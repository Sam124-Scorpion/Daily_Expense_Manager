import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

    
const API = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API}/api`;

const ExpenseReport = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        search: ''
    });
    const [aiInsight, setAiInsight] = useState('');
    const [aiProvider, setAiProvider] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        fetchExpenses(userId);
    }, [userId, navigate]);

    const fetchExpenses = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/manage-expense/${id}/`);
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                const nextExpenses = Array.isArray(data)
                    ? data
                    : data?.expenses || [];
                setExpenses(nextExpenses);
            } else {
                toast.error(data?.message || 'Unable to load expense report');
            }
        } catch (error) {
            console.error('Expense report fetch error:', error);
            toast.error('Network error while loading report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            search: ''
        });
    };

    const toDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const filteredExpenses = useMemo(() => {
        if (!expenses.length) return [];

        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;
        const search = filters.search.trim().toLowerCase();

        return expenses.filter((expense) => {
            const expenseDate = toDate(expense.ExpenseDate);

            const matchesStart = !start || (expenseDate && expenseDate >= start);
            const matchesEnd = !end || (expenseDate && expenseDate <= end);
            const matchesSearch =
                !search ||
                (expense.ExpenseItem && expense.ExpenseItem.toLowerCase().includes(search));

            return matchesStart && matchesEnd && matchesSearch;
        });
    }, [expenses, filters]);

    const reportStats = useMemo(() => {
        if (!filteredExpenses.length) {
            return {
                total: 0,
                average: 0,
                highest: null,
                count: 0
            };
        }

        const totals = filteredExpenses.reduce(
            (acc, expense) => {
                const amount = Number(expense.ExpenseCost) || 0;
                acc.total += amount;
                if (amount > acc.highestAmount) {
                    acc.highestAmount = amount;
                    acc.highest = expense;
                }
                return acc;
            },
            { total: 0, highestAmount: 0, highest: null }
        );

        return {
            total: totals.total,
            average: totals.total / filteredExpenses.length,
            highest: totals.highest,
            count: filteredExpenses.length
        };
    }, [filteredExpenses]);

    const formatAmount = (value) => {
        const amount = Number(value);
        if (!Number.isFinite(amount)) return '₹0.00';
        return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (value) => {
        const date = toDate(value);
        if (!date) return '—';
        return date.toLocaleDateString();
    };

    const downloadCSV = () => {
        if (!filteredExpenses.length) {
            toast.info('No expenses to export');
            return;
        }

        const headers = ['Date', 'Item', 'Cost'];
        const rows = filteredExpenses.map((expense) => [
            formatDate(expense.ExpenseDate),
            `"${expense.ExpenseItem?.replace(/"/g, '""') || ''}"`,
            Number(expense.ExpenseCost) || 0
        ]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'expense-report.csv';
        link.click();

        URL.revokeObjectURL(url);
    };

    const generateInsights = async () => {
        if (!expenses.length) {
            toast.info('Add expenses to request insights');
            return;
        }

        setIsAiLoading(true);
        setAiInsight('');
        try {
            const response = await fetch(`${API_BASE_URL}/ai/insights/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters })
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setAiInsight(data?.insight || '');
                setAiProvider(data?.provider || '');
                toast.success('Insights ready');
            } else {
                toast.error(data?.message || 'Unable to generate insights');
            }
        } catch (error) {
            console.error('AI insight error:', error);
            toast.error('Network error while generating insights');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className='container py-4 px-1  h-auto' style={{ marginTop : '4rem'}}>
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4'>
                <div>
                    <h2 className='fw-bold mb-1'><i className='fas fa-file-alt me-2'></i>Expense Report</h2>
                    <p className='text-muted mb-0'>Filter, export and review your spending history.</p>
                </div>
                <div className='d-flex flex-column flex-sm-row gap-2'>
                    <button className='btn btn-outline-secondary' onClick={clearFilters}>
                        Clear filters
                    </button>
                    <button className='btn btn-primary' onClick={downloadCSV}>
                        <i className='fas fa-download me-2'></i>Export CSV
                    </button>
                    <button
                        className='btn btn-dark'
                        onClick={generateInsights}
                        disabled={isAiLoading}
                    >
                        {isAiLoading ? 'Analysing...' : (
                            <>
                                <i className='fas fa-robot me-2'></i>AI insights
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className='card shadow-sm border-0 mb-4'>
                <div className='card-body'>
                    <div className='row g-3'>
                        <div className='col-12 col-md-4'>
                            <label className='form-label text-muted'>From</label>
                            <input
                                type='date'
                                className='form-control'
                                name='startDate'
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className='col-12 col-md-4'>
                            <label className='form-label text-muted'>To</label>
                            <input
                                type='date'
                                className='form-control'
                                name='endDate'
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className='col-12 col-md-4'>
                            <label className='form-label text-muted'>Search keyword</label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Groceries, rent...'
                                name='search'
                                value={filters.search}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4'>
                <div className='col'>
                    <div className='card h-100 border-0 shadow-sm bg-primary text-white'>
                        <div className='card-body'>
                            <p className='text-uppercase small mb-2'>Total spent</p>
                            <h3 className='fw-bold mb-0'>{formatAmount(reportStats.total)}</h3>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='card h-100 border-0 shadow-sm'>
                        <div className='card-body'>
                            <p className='text-uppercase small text-muted mb-2'>Average per entry</p>
                            <h3 className='fw-bold mb-0'>{formatAmount(reportStats.average)}</h3>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='card h-100 border-0 shadow-sm bg-warning-subtle'>
                        <div className='card-body'>
                            <p className='text-uppercase small text-muted mb-2'>Entries</p>
                            <h3 className='fw-bold mb-0'>{reportStats.count}</h3>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='card h-100 border-0 shadow-sm bg-success-subtle'>
                        <div className='card-body'>
                            <p className='text-uppercase small text-muted mb-2'>Highest entry</p>
                            <h3 className='fw-bold mb-1'>
                                {reportStats.highest ? formatAmount(reportStats.highest.ExpenseCost) : '—'}
                            </h3>
                            <small className='text-muted'>
                                {reportStats.highest?.ExpenseItem || 'No data yet'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card shadow-sm border-0 mb-4'>
                <div className='card-body p-0'>
                    <div className='table-responsive rounded'>
                        <table className='table table-hover mb-0 align-middle'>
                            <thead className='table-light'>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Item</th>
                                    <th className='text-end'>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className='text-center py-4'>Loading report...</td>
                                    </tr>
                                ) : filteredExpenses.length ? (
                                    filteredExpenses.map((expense, index) => (
                                        <tr key={expense.id}>
                                            <td>{index + 1}</td>
                                            <td>{formatDate(expense.ExpenseDate)}</td>
                                            <td>{expense.ExpenseItem}</td>
                                            <td className='text-end fw-semibold'>{formatAmount(expense.ExpenseCost)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className='text-center py-4 text-muted'>
                                            No expenses match the filters above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {(aiInsight || isAiLoading) && (
                <div className='card border-0 shadow-sm mt-4'>
                    <div className='card-body'>
                        <div className='d-flex justify-content-between mb-2'>
                            <h5 className='card-title mb-0'>
                                <i className='fas fa-robot me-2 text-primary'></i>
                                Personalised insights
                            </h5>
                            {aiProvider && (
                                <span className='badge text-bg-light text-uppercase'>{aiProvider}</span>
                            )}
                        </div>
                        {isAiLoading ? (
                            <p className='text-muted mb-0'>Crunching the numbers...</p>
                        ) : (
                            <pre className='mb-0 bg-light p-3 rounded' style={{ whiteSpace: 'pre-wrap' }}>
                                {aiInsight}
                            </pre>
                        )}
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-center" />
            <title>Expense Report - Expense Tracker</title>
        <meta name="description" content="Expense Report - Expense Tracker" />
        </div>
    )
}

export default ExpenseReport