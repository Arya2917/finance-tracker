import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/BudgetManager.css';

export const BudgetManager = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  const fetchBudgets = async () => {
    if (!user?.uid) return;
    
    const q = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'budgets'), {
        userId: user.uid,
        category: newCategory,
        amount: parseFloat(newAmount),
        spent: 0,
        createdAt: new Date()
      });
      setNewCategory('');
      setNewAmount('');
      fetchBudgets();
      setNotification('Budget category added successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      setNotification('Error adding budget category. Please try again.');
    }
  };

  const calculateProgress = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <div className="budget-manager-container">
      <h2>Budget Manager</h2>
      {notification && <div className="notification">{notification}</div>}

      <form onSubmit={handleSubmit} className="budget-form">
        <div className="form-group">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category Name"
            className="input-field"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Budget Amount"
            className="input-field"
            required
          />
        </div>

        <button type="submit" className="add-button">
          Add Budget Category
        </button>
      </form>

      <div className="budgets-list">
        {budgets.map(budget => (
          <div key={budget.id} className="budget-item">
            <div className="budget-info">
              <h3>{budget.category}</h3>
              <p>Budget: ${budget.amount}</p>
              <p>Spent: ${budget.spent}</p>
            </div>
            <div className="progress-bar">
              <div 
                className="progress"
                style={{ 
                  width: `${calculateProgress(budget)}%`,
                  backgroundColor: calculateProgress(budget) > 90 ? '#ff4444' : '#4CAF50'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};