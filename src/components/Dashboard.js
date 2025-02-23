import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, loading, error, addTransaction, deleteTransaction } = useTransactions(user?.uid);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('expense');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      amount: parseFloat(amount),
      category,
      description,
      type: category === 'income' ? 'income' : 'expense'
    });
    setAmount('');
    setDescription('');
  };

  const chartData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    const existingDay = acc.find(d => d.date === date);
    
    if (existingDay) {
      if (transaction.type === 'income') {
        existingDay.income += transaction.amount;
      } else {
        existingDay.expense += transaction.amount;
      }
    } else {
      acc.push({
        date,
        income: transaction.type === 'income' ? transaction.amount : 0,
        expense: transaction.type === 'expense' ? transaction.amount : 0
      });
    }
    return acc;
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Financial Dashboard</h1>
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-group">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="input-field"
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="input-field"
            required
          />
        </div>
        <div className="input-group">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select-field"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button type="submit" className="submit-button">
          Add Transaction
        </button>
      </form>

      <div className="transactions-list">
        <h2 className="dashboard-title">Recent Transactions</h2>
        <div className="transaction-items">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-date">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
              <div className="transaction-actions">
                <span className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                </span>
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <h2 className="dashboard-title">Transaction History</h2>
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#4CAF50" />
          <Bar dataKey="expense" fill="#f44336" />
        </BarChart>
      </div>
    </div>
  );
};