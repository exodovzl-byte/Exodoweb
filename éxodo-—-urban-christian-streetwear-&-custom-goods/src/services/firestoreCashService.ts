import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TreasuryAccounts, CashTransaction } from '../types';

// Initialize Firebase App & Firestore Singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

const CASH_BALANCES_DOC = 'treasury_cash_balances';
const CASH_TRANSACTIONS_COLLECTION = 'cash_transactions';

export interface CashRegisterData {
  efectivoUSD: number;
  efectivoVES: number;
  binanceUSDT: number;
  bancoDelTesoroVES: number;
  lastUpdated: string;
  updatedBy?: string;
}

/**
 * Save updated cash balances to Firestore with local storage backup
 */
export async function saveCashBalancesToFirestore(
  accounts: TreasuryAccounts, 
  updatedBy: string = 'Administrador'
): Promise<boolean> {
  const payload: CashRegisterData = {
    efectivoUSD: accounts.efectivoUSD ?? 0,
    efectivoVES: accounts.efectivoVES ?? 0,
    binanceUSDT: accounts.binanceUSDT ?? 0,
    bancoDelTesoroVES: accounts.bancoDelTesoroVES ?? 0,
    lastUpdated: new Date().toISOString(),
    updatedBy,
  };

  // Always update local storage first for instant responsiveness
  try {
    localStorage.setItem('exodo_cash_balances', JSON.stringify(payload));
  } catch (e) {
    console.warn('Error saving to localStorage:', e);
  }

  // Sync to Firestore
  try {
    const docRef = doc(db, 'treasury', CASH_BALANCES_DOC);
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore sync warning (falling back to local state):', err);
    return false;
  }
}

/**
 * Save a new cash transaction to Firestore
 */
export async function saveCashTransactionToFirestore(
  transaction: CashTransaction
): Promise<boolean> {
  // Always update local cache
  try {
    const cached = JSON.parse(localStorage.getItem('exodo_transactions') || '[]');
    localStorage.setItem('exodo_transactions', JSON.stringify([transaction, ...cached]));
  } catch (e) {}

  try {
    const docRef = doc(db, CASH_TRANSACTIONS_COLLECTION, transaction.id);
    await setDoc(docRef, {
      ...transaction,
      createdAt: transaction.date || new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore transaction save warning:', err);
    return false;
  }
}

/**
 * Real-time listener for multi-device sync across administrator phones and PCs
 */
export function subscribeToFirestoreCashBalances(
  onUpdate: (balances: CashRegisterData) => void,
  onError?: (error: any) => void
): Unsubscribe {
  try {
    const docRef = doc(db, 'treasury', CASH_BALANCES_DOC);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CashRegisterData;
          onUpdate(data);
        }
      },
      (error) => {
        console.warn('Firestore real-time subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (e) {
    console.warn('Cannot attach Firestore listener:', e);
    return () => {};
  }
}
