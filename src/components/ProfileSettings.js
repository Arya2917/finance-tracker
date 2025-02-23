import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/ProfileSettings.css';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || '');
            setCurrency(data.currency || 'INR');
            setMonthlyBudget(data.monthlyBudget || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use setDoc instead of updateDoc to ensure the document exists
      await setDoc(doc(db, 'userProfiles', user.uid), {
        displayName,
        currency,
        monthlyBudget: parseFloat(monthlyBudget) || 0,
        updatedAt: new Date()
      });
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({ message: 'Error updating profile. Please try again.', type: 'error' });
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  return (
    <div className="profile-settings-container">
      <h2>Profile Settings</h2>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label>Preferred Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="select-field"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Monthly Budget</label>
          <input
            type="number"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="input-field"
            placeholder="Enter monthly budget"
          />
        </div>

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};