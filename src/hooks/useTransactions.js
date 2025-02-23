import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addTransaction = async (transaction) => {
    try {
      setError(null);
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId,
        date: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      setError(err.message);
    }
  };

  return { transactions, loading, error, addTransaction, deleteTransaction };
};