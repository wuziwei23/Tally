import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { get, set, KEYS } from '../utils/storage';
import { generateSampleTransactions } from '../data/sampleData';
import { getMonthKey } from '../utils/format';

const TransactionContext = createContext(null);

function transactionReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, transactions: action.payload };
    case 'ADD':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'DELETE':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'CLEAR':
      return { ...state, transactions: [] };
    default:
      return state;
  }
}

export function TransactionProvider({ children }) {
  const [state, dispatch] = useReducer(transactionReducer, {
    transactions: [],
  });

  // Load on mount, seed if empty
  useEffect(() => {
    let txns = get(KEYS.TRANSACTIONS);
    if (!txns || txns.length === 0) {
      txns = generateSampleTransactions();
      set(KEYS.TRANSACTIONS, txns);
    }
    dispatch({ type: 'LOAD', payload: txns });
  }, []);

  // Persist on change
  useEffect(() => {
    if (state.transactions.length > 0 || get(KEYS.TRANSACTIONS)?.length > 0) {
      set(KEYS.TRANSACTIONS, state.transactions);
    }
  }, [state.transactions]);

  function addTransaction(txn) {
    dispatch({ type: 'ADD', payload: txn });
  }

  function deleteTransaction(id) {
    dispatch({ type: 'DELETE', payload: id });
  }

  function clearAll() {
    dispatch({ type: 'CLEAR' });
    set(KEYS.TRANSACTIONS, []);
  }

  // Derived summary
  const summary = useMemo(() => {
    const txns = state.transactions;
    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = {};
    const byMonth = {};

    for (const t of txns) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      // By category
      const catKey = t.categoryId;
      if (!byCategory[catKey]) {
        byCategory[catKey] = { income: 0, expense: 0 };
      }
      byCategory[catKey][t.type] += t.amount;

      // By month
      const monthKey = getMonthKey(t.date);
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { income: 0, expense: 0 };
      }
      byMonth[monthKey][t.type] += t.amount;
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
      byMonth,
    };
  }, [state.transactions]);

  return (
    <TransactionContext.Provider value={{ ...state, ...summary, addTransaction, deleteTransaction, clearAll }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
}
