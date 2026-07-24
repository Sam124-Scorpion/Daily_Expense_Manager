import React, { useState } from 'react';
import './AIInsights.css';
import { API_BASE_URL } from '../config/api';

const AIInsights = ({ userId }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAIInsights = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/ai/insights/${userId}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setInsights(data);
            } else {
                setError(data.message || 'Failed to fetch insights');
            }
        } catch (err) {
            setError('Network error: Could not connect to server');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="ai-insights-container">
            <div className="insights-header">
                <h2>💡 AI Expense Insights</h2>
                <p className="subtitle">Get personalized financial advice powered by AI</p>
            </div>



            <button 
                className="generate-btn" 
                onClick={fetchAIInsights}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        Analyzing your expenses...
                    </>
                ) : (
                    <>
                        <span className="icon">✨</span>
                        Generate Insights
                    </>
                )}
            </button>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {insights && (
                <div className="insights-content">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <span className="stat-label">Total Expenses</span>
                                <span className="stat-value">
                                    {formatCurrency(insights.total_expenses)}
                                </span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <span className="stat-label">Average Expense</span>
                                <span className="stat-value">
                                    {formatCurrency(insights.average_expense)}
                                </span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <span className="stat-label">Transactions</span>
                                <span className="stat-value">
                                    {insights.expense_count}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="ai-analysis">
                        <div className="analysis-header">
                            <h3>AI Analysis</h3>
                            <span className="provider-badge">
                                🤖 OpenAI GPT-3.5
                            </span>
                        </div>
                        <div className="analysis-content">
                            {insights.insight.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>

                    <div className="insight-footer">
                        <small>
                            💡 Insights are generated based on your recent expense history
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInsights;
