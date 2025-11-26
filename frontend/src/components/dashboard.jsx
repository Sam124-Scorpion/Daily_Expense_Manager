import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/manage-expense/${userId}/`);
                const data = await response.json().catch(() => ({}));

                if (response.ok) {
                    const nextExpenses = Array.isArray(data)
                        ? data
                        : data?.expenses || [];
                    setExpenses(nextExpenses);
                } else {
                    toast.error(data?.message || 'Unable to load expenses');
                }
            } catch (error) {
                toast.error('Network error while loading dashboard');
                console.error('Dashboard fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId, navigate]);

    const toAmount = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const { totalExpense, averageExpense, highestExpense, recentExpenses } = useMemo(() => {
        if (!expenses.length) {
            return {
                totalExpense: 0,
                averageExpense: 0,
                highestExpense: null,
                recentExpenses: [],
            };
        }

        const total = expenses.reduce((sum, expense) => sum + toAmount(expense.ExpenseCost), 0);
        const highest = expenses.reduce((max, expense) =>
            toAmount(expense.ExpenseCost) > toAmount(max?.ExpenseCost)
                ? expense
                : max,
            expenses[0]
        );

        const recent = [...expenses]
            .sort((a, b) => new Date(b.ExpenseDate) - new Date(a.ExpenseDate))
            .slice(0, 5);

        return {
            totalExpense: total,
            averageExpense: total / expenses.length,
            highestExpense: highest,
            recentExpenses: recent,
        };
    }, [expenses]);

    const monthlyChart = useMemo(() => {
        if (!expenses.length) {
            return [];
        }

        const monthlyTotals = expenses.reduce((acc, expense) => {
            if (!expense.ExpenseDate) {
                return acc;
            }
            const date = new Date(expense.ExpenseDate);
            if (Number.isNaN(date.getTime())) return acc;

            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

            if (!acc[key]) {
                acc[key] = { label, total: 0, order: date.getTime() };
            }
            acc[key].total += toAmount(expense.ExpenseCost);
            return acc;
        }, {});

        return Object.values(monthlyTotals)
            .sort((a, b) => a.order - b.order)
            .slice(-6);
    }, [expenses]);

    const chartMaxValue = monthlyChart.reduce(
        (max, month) => Math.max(max, month.total),
        0
    ) || 1;

    const categoryChart = useMemo(() => {
        if (!expenses.length) return [];

        const totals = expenses.reduce((acc, expense) => {
            const key = expense.ExpenseItem || 'Other';
            const amount = toAmount(expense.ExpenseCost);
            if (!acc[key]) {
                acc[key] = { label: key, total: 0 };
            }
            acc[key].total += amount;
            return acc;
        }, {});

        return Object.values(totals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 6);
    }, [expenses]);

    const pieChartData = useMemo(() => {
        if (!categoryChart.length) {
            return {
                labels: [],
                datasets: [],
            };
        }
        const baseColors = [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
        ];

        return {
            labels: categoryChart.map((c) => c.label),
            datasets: [
                {
                    data: categoryChart.map((c) => c.total),
                    backgroundColor: baseColors.slice(0, categoryChart.length),
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                },
            ],
        };
    }, [categoryChart]);

    return (
        <div className='container py-4 px-1'>
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4'>
                <div>
                    <h2 className='fw-bold mb-1'>Welcome back, {userName || 'Explorer'} 👋</h2>
                    <p className='text-muted mb-0'>Track how your spending evolves over time.</p>
                </div>
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => navigate('/add-expense')}
                >
                    <i className='fas fa-plus-circle me-2'></i>Add new expense
                </button>
            </div>

            <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4'>
                <div className='col'>
                    <div className='card h-100 text-white bg-primary'>
                        <div className='card-body'>
                            <p className='text-uppercase small mb-2'>Total spent</p>
                            <h3 className='fw-bold'>₹{totalExpense.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='card h-100 text-white bg-success'>
                        <div className='card-body'>
                            <p className='text-uppercase small mb-2'>Average per entry</p>
                            <h3 className='fw-bold'>₹{averageExpense.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='card h-100 text-dark bg-warning'>
                        <div className='card-body'>
                            <p className='text-uppercase small mb-2'>Entries logged</p>
                            <h3 className='fw-bold'>{expenses.length}</h3>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='card h-100 text-white bg-danger'>
                        <div className='card-body'>
                            <p className='text-uppercase small mb-2'>Highest expense</p>
                            <h3 className='fw-bold'>
                                {highestExpense
                                    ? `₹${toAmount(highestExpense.ExpenseCost).toFixed(2)}`
                                    : '—'}
                            </h3>
                            <small>
                                {highestExpense?.ExpenseItem || 'No data yet'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row g-4'>
                <div className='col-12 col-lg-7'>
                    <div className='card h-100 shadow-sm'>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                <h5 className='card-title mb-0'>Monthly spending trend</h5>
                                <span className='text-muted small'>Last 6 months</span>
                            </div>
                            {isLoading ? (
                                <div className='text-center py-5 text-muted'>Loading chart...</div>
                            ) : monthlyChart.length ? (
                                <div style={{ height: '220px' }} className='d-flex align-items-end justify-content-between gap-3'>
                                    {monthlyChart.map((month) => (
                                        <div key={month.label} className='text-center flex-fill'>
                                            <div
                                                className='w-100 rounded-top bg-primary mx-auto'
                                                style={{
                                                    height: `${(month.total / chartMaxValue) * 100 || 0}%`,
                                                    minHeight: '8px',
                                                    transition: 'height 0.4s ease',
                                                }}
                                            ></div>
                                            <small className='d-block mt-2 fw-semibold'>{month.label}</small>
                                            <small className='text-muted'>₹{month.total.toFixed(0)}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-5 text-muted'>
                                    Add expenses to visualize your trend
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='col-12 col-lg-5'>
                    <div className='card h-100 shadow-sm'>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                <h5 className='card-title mb-0'>Recent activity</h5>
                                <button
                                    className='btn btn-link p-0 text-decoration-none'
                                    onClick={() => navigate('/manage-expense')}
                                >
                                    View all
                                </button>
                            </div>
                            {isLoading ? (
                                <div className='text-center py-5 text-muted'>Loading expenses...</div>
                            ) : recentExpenses.length ? (
                                <ul className='list-group list-group-flush'>
                                    {recentExpenses.map((expense) => (
                                        <li key={expense.id} className='list-group-item d-flex justify-content-between'>
                                            <div>
                                                <p className='fw-semibold mb-1'>{expense.ExpenseItem}</p>
                                                <small className='text-muted'>{expense.ExpenseDate}</small>
                                            </div>
                                            <span className='fw-bold'>₹{toAmount(expense.ExpenseCost).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className='text-center py-5 text-muted'>
                                    Add your first expense to see it here
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className='row g-4 mt-1'>
                <div className='col-12 col-lg-6'>
                    <div className='card h-100 shadow-sm'>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                <h5 className='card-title mb-0'>Spending by category</h5>
                                <span className='text-muted small'>Top {categoryChart.length || 0}</span>
                            </div>
                            {isLoading ? (
                                <div className='text-center py-5 text-muted'>Loading chart...</div>
                            ) : categoryChart.length ? (
                                <div style={{ height: '260px' }}>
                                    <Pie
                                        data={pieChartData}
                                        options={{
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        boxWidth: 12,
                                                        boxHeight: 12,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className='text-center py-5 text-muted'>
                                    Add expenses to see category-wise breakdown
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="bottom-center" />
        <title>Dashboard - Expense Tracker</title>
        <meta name="description" content="Dashboard - Expense Tracker" />
        </div>
    );
};

export default Dashboard;