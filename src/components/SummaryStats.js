import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  LineChart, Line, AreaChart, Area, RadarChart, Radar, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import '../styles/SummaryStats.css';

export const SummaryStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    categoryData: [],
  });

  const [chartType, setChartType] = useState('bar'); // Default chart type

  useEffect(() => {
    if (user?.uid) {
      calculateStats();
    }
  }, [user]);

  const calculateStats = async () => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => doc.data());

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Group transactions by category (both income and expense)
    const categoryTotals = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      acc[t.category][t.type] += t.amount;
      return acc;
    }, {});

    const categoryData = Object.keys(categoryTotals).map((name) => ({
      name,
      income: categoryTotals[name].income,
      expense: categoryTotals[name].expense,
    }));

    setStats({
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      categoryData,
    });
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const renderChart = useMemo(() => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={stats.categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatINR(value)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#4CAF50" name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#f44336" name="Expenses" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={stats.categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatINR(value)} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#4CAF50" fill="#A5D6A7" name="Income" />
            <Area type="monotone" dataKey="expense" stroke="#f44336" fill="#EF9A9A" name="Expenses" />
          </AreaChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.categoryData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Tooltip formatter={(value) => formatINR(value)} />
            <Radar name="Income" dataKey="income" stroke="#4CAF50" fill="#A5D6A7" fillOpacity={0.6} />
            <Radar name="Expenses" dataKey="expense" stroke="#f44336" fill="#EF9A9A" fillOpacity={0.6} />
          </RadarChart>
        );
      default:
        return (
          <BarChart data={stats.categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatINR(value)} />
            <Legend />
            <Bar dataKey="income" fill="#4CAF50" name="Income" />
            <Bar dataKey="expense" fill="#f44336" name="Expenses" />
          </BarChart>
        );
    }
  }, [chartType, stats.categoryData]);

  return (
    <div className="summary-stats-container">
      <h2>Financial Summary</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Income</h3>
          <p className="amount income">{formatINR(stats.totalIncome)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="amount expense">{formatINR(stats.totalExpenses)}</p>
        </div>
        <div className="stat-card">
          <h3>Net Savings</h3>
          <p className={`amount ${stats.netSavings >= 0 ? 'income' : 'expense'}`}>
            {formatINR(Math.abs(stats.netSavings))}
          </p>
        </div>
      </div>

      <div className="chart-controls">
        <button onClick={() => setChartType('bar')}>Bar Chart</button>
        <button onClick={() => setChartType('line')}>Line Chart</button>
        <button onClick={() => setChartType('area')}>Area Chart</button>
        <button onClick={() => setChartType('radar')}>Radar Chart</button>
      </div>

      <div className="chart-section">
        <h3>Income & Expense Categories</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            {renderChart}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
