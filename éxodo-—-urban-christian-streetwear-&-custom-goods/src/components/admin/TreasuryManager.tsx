import React, { useState } from 'react';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  UserX, 
  Search, 
  FileText, 
  RefreshCw, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Check,
  X,
  CreditCard,
  AlertCircle,
  Banknote,
  Repeat,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CashTransaction, DebtRecord } from '../../types';

export const TreasuryManager: React.FC = () => {
  const { 
    treasuryAccounts, 
    updateTreasuryBalance, 
    recordCashOperation,
    isFirestoreSynced,
    transactions, 
    addTransaction, 
    debts, 
    addDebt, 
    recordDebtPayment, 
    deleteDebt,
    cashCloses,
    exchangeRateBCV 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'cash_box' | 'debts' | 'transactions' | 'closes'>('overview');

  // Manual Adjust Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustAccount, setAdjustAccount] = useState<'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'>('binance_usdt');
  const [newBalanceInput, setNewBalanceInput] = useState<string>('');
  const [adjustNote, setAdjustNote] = useState<string>('');

  // Income / Expense Modal
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'ingreso' | 'egreso'>('egreso');
  const [txAccount, setTxAccount] = useState<'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'>('efectivo_usd');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txConcept, setTxConcept] = useState<string>('');
  const [txCategory, setTxCategory] = useState<'proveedor' | 'retiro' | 'gasto_operativo' | 'pedido' | 'compra_efectivo' | 'venta_efectivo' | 'otro'>('proveedor');

  // Cash Exchange / Compra-Venta Modal
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeType, setExchangeType] = useState<'compra_efectivo' | 'venta_efectivo' | 'cambio_divisa'>('compra_efectivo');
  const [exchangeSourceAcc, setExchangeSourceAcc] = useState<'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'>('banco_del_tesoro_ves');
  const [exchangeTargetAcc, setExchangeTargetAcc] = useState<'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'>('efectivo_usd');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeRateCustom, setExchangeRateCustom] = useState(exchangeRateBCV.toString());
  const [exchangeConcept, setExchangeConcept] = useState('');

  // New Debt Modal ("Quién me debe")
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');
  const [debtConcept, setDebtConcept] = useState('');
  const [debtTotalUSD, setDebtTotalUSD] = useState('');
  const [debtNotes, setDebtNotes] = useState('');

  // Record Payment for Debt Modal
  const [paymentDebtModalOpen, setPaymentDebtModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);
  const [paymentAmountUSD, setPaymentAmountUSD] = useState('');
  const [paymentTargetAccount, setPaymentTargetAccount] = useState<'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'>('efectivo_usd');

  // Interactive Cash Arqueo Calculator State
  const [billsCount, setBillsCount] = useState<{ [denom: number]: number }>({
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
  });

  // Filters
  const [txFilterAccount, setTxFilterAccount] = useState<string>('todas');
  const [txFilterType, setTxFilterType] = useState<string>('todos');
  const [debtSearch, setDebtSearch] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Balances
  const binanceUSD = treasuryAccounts.binanceUSDT || 0;
  const tesoroVES = treasuryAccounts.bancoDelTesoroVES || 0;
  const efectivoUSD = treasuryAccounts.efectivoUSD || 0;
  const efectivoVES = treasuryAccounts.efectivoVES || 0;
  
  const tesoroEquivalentUSD = tesoroVES / (exchangeRateBCV || 46);
  const efectivoVESEquivalentUSD = efectivoVES / (exchangeRateBCV || 46);
  const totalCashUSD = efectivoUSD + efectivoVESEquivalentUSD;
  const totalConsolidatedUSD = binanceUSD + tesoroEquivalentUSD + efectivoUSD + efectivoVESEquivalentUSD;
  const totalDebtsUSD = debts.reduce((acc, d) => acc + (d.status !== 'cobrado' ? d.remainingUSD : 0), 0);

  // Arqueo Calculator total
  const calculatedArqueoUSD = Object.entries(billsCount).reduce(
    (sum, [denom, count]) => sum + Number(denom) * (Number(count) || 0),
    0
  );

  // Submit Balance Adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBalanceInput);
    if (isNaN(val) || val < 0) {
      alert('Ingresa un monto válido.');
      return;
    }
    updateTreasuryBalance(adjustAccount, val, adjustNote);
    const names = {
      binance_usdt: 'Binance USDT',
      banco_del_tesoro_ves: 'Banco del Tesoro Bs.',
      efectivo_usd: 'Caja Efectivo USD',
      efectivo_ves: 'Caja Efectivo Bs.',
    };
    showToast(`Saldo de ${names[adjustAccount]} ajustado a ${val.toFixed(2)}.`);
    setAdjustModalOpen(false);
    setNewBalanceInput('');
    setAdjustNote('');
  };

  // Submit Income / Expense
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa un monto válido mayor a 0.');
      return;
    }
    const isUSD = txAccount === 'binance_usdt' || txAccount === 'efectivo_usd';
    const amountUSD = isUSD ? amount : amount / (exchangeRateBCV || 46);

    recordCashOperation({
      account: txAccount,
      type: txType,
      amount,
      concept: txConcept || (txType === 'ingreso' ? 'Ingreso registrado en caja' : 'Retiro / Gasto operativo'),
      category: txCategory,
    });

    const accountLabels = {
      binance_usdt: 'USDT',
      banco_del_tesoro_ves: 'Bs.',
      efectivo_usd: '$ Efectivo',
      efectivo_ves: 'Bs. Efectivo',
    };

    showToast(`Movimiento de ${txType.toUpperCase()} registrado por ${amount.toFixed(2)} ${accountLabels[txAccount]}`);
    setTxModalOpen(false);
    setTxAmount('');
    setTxConcept('');
  };

  // Submit Cash Exchange (Compra / Venta de Efectivo)
  const handleSaveExchange = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(exchangeAmount);
    const rate = parseFloat(exchangeRateCustom) || exchangeRateBCV;
    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa un monto válido mayor a 0.');
      return;
    }

    recordCashOperation({
      account: exchangeTargetAcc,
      type: exchangeType,
      amount,
      counterpartAccount: exchangeSourceAcc,
      exchangeRateUsed: rate,
      concept: exchangeConcept || (exchangeType === 'compra_efectivo' 
        ? `Compra de efectivo ($${amount}) pagando con ${exchangeSourceAcc}`
        : `Venta de efectivo ($${amount}) recibiendo en ${exchangeTargetAcc}`),
      category: exchangeType,
    });

    showToast(`Operación de ${exchangeType.replace('_', ' ').toUpperCase()} ejecutada con éxito.`);
    setExchangeModalOpen(false);
    setExchangeAmount('');
    setExchangeConcept('');
  };

  // Submit New Debt
  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const usd = parseFloat(debtTotalUSD);
    if (isNaN(usd) || usd <= 0 || !debtorName.trim()) {
      alert('Ingresa el nombre del deudor y un monto válido en USD.');
      return;
    }
    const ves = usd * exchangeRateBCV;
    addDebt({
      debtorName: debtorName.trim(),
      debtorPhone: debtorPhone.trim(),
      concept: debtConcept.trim() || 'Venta a crédito o saldo pendiente',
      totalUSD: usd,
      totalVES: ves,
      notes: debtNotes.trim(),
    });

    showToast(`Cuenta por cobrar registrada para ${debtorName} ($${usd.toFixed(2)} USD).`);
    setDebtModalOpen(false);
    setDebtorName('');
    setDebtorPhone('');
    setDebtConcept('');
    setDebtTotalUSD('');
    setDebtNotes('');
  };

  // Submit Debt Payment
  const handleSaveDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;
    const paidUSD = parseFloat(paymentAmountUSD);
    if (isNaN(paidUSD) || paidUSD <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }
    const paidVES = paidUSD * exchangeRateBCV;
    recordDebtPayment(selectedDebt.id, paidUSD, paidVES, paymentTargetAccount);
    const targetNames = {
      binance_usdt: 'Binance USDT',
      banco_del_tesoro_ves: 'Banco del Tesoro Bs.',
      efectivo_usd: 'Caja Efectivo USD',
      efectivo_ves: 'Caja Efectivo Bs.',
    };
    showToast(`Abono de $${paidUSD.toFixed(2)} USD registrado y acreditado en ${targetNames[paymentTargetAccount]}.`);
    setPaymentDebtModalOpen(false);
    setSelectedDebt(null);
    setPaymentAmountUSD('');
  };

  // Filtered Transactions
  const filteredTxs = transactions.filter((t) => {
    if (txFilterAccount !== 'todas' && t.account !== txFilterAccount) return false;
    if (txFilterType !== 'todos' && t.type !== txFilterType) return false;
    return true;
  });

  // Cash Only Transactions
  const cashOnlyTxs = transactions.filter((t) => t.account === 'efectivo_usd' || t.account === 'efectivo_ves');

  // Filtered Debts
  const filteredDebts = debts.filter((d) => {
    if (!debtSearch.trim()) return true;
    const q = debtSearch.toLowerCase();
    return d.debtorName.toLowerCase().includes(q) || d.debtorPhone.includes(q) || d.concept.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-400 text-black text-xs font-black shadow-2xl flex items-center gap-2">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner with Firestore Real-time Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-[#0D253A]/70 to-neutral-950 border border-neutral-800 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                <Wallet size={22} />
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
                Tesorería, Caja en Efectivo & Flujo de Fondos
              </h2>
              {/* Firestore Real-time Sync Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-[10px] text-emerald-300 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isFirestoreSynced ? 'Sincronizado en Tiempo Real con Firestore' : 'Caja Local con Respaldo Multi-dispositivo'}</span>
              </div>
            </div>
            <p className="text-xs text-neutral-300 mt-2 max-w-3xl leading-relaxed">
              Control integral de saldos: <strong className="text-amber-400">Binance Pay (USDT)</strong>, <strong className="text-sky-400">Banco del Tesoro (Bolívares)</strong>, y <strong className="text-emerald-400">Caja en Efectivo Físico (USD / Bs)</strong>. Permite registro automático de pedidos, compras/ventas de efectivo, y seguimiento de deudores.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setExchangeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Repeat size={14} />
              <span>Compra / Venta Efectivo</span>
            </button>

            <button
              onClick={() => {
                setTxType('egreso');
                setTxAccount('efectivo_usd');
                setTxModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Minus size={14} />
              <span>- Retiro / Egreso</span>
            </button>

            <button
              onClick={() => {
                setTxType('ingreso');
                setTxAccount('efectivo_usd');
                setTxModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Plus size={14} />
              <span>+ Ingreso</span>
            </button>

            <button
              onClick={() => setDebtModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <CreditCard size={14} />
              <span>+ Deuda / Crédito</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNT BALANCES CARDS GRID (6 Cards: Consolidado, Binance, Tesoro, Efectivo USD, Efectivo VES, Cuentas por Cobrar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* CARD 1: TOTAL CONSOLIDATED IN USD */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-750 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold block">
              1. Total Consolidado
            </span>
            <span className="text-2xl font-black text-white font-mono mt-2 block">
              ${totalConsolidatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
            </span>
            <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
              ~ Bs. {(totalConsolidatedUSD * exchangeRateBCV).toFixed(2)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
            <span>Tasa BCV: {exchangeRateBCV.toFixed(2)}</span>
            <span className="text-emerald-400 font-bold">Activo</span>
          </div>
        </div>

        {/* CARD 2: BINANCE USDT */}
        <div className="p-5 rounded-2xl bg-[#0D253A]/60 border border-amber-400/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                2. Binance Pay
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[9px] font-mono border border-amber-400/20">
                USDT
              </span>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono mt-2 block">
              ${binanceUSD.toFixed(2)} <span className="text-xs text-neutral-300 font-normal">USDT</span>
            </span>
            <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
              Cripto / Digital
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                setAdjustAccount('binance_usdt');
                setNewBalanceInput(binanceUSD.toString());
                setAdjustModalOpen(true);
              }}
              className="text-[10px] font-mono text-neutral-300 hover:text-white underline cursor-pointer"
            >
              Ajustar Saldo
            </button>
            <span className="text-[10px] text-emerald-400 font-mono">En Línea</span>
          </div>
        </div>

        {/* CARD 3: BANCO DEL TESORO BS */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-sky-500/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold">
                3. Banco del Tesoro
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-400/10 text-sky-400 text-[9px] font-mono border border-sky-400/20">
                0163
              </span>
            </div>
            <span className="text-2xl font-black text-white font-mono mt-2 block">
              Bs. {tesoroVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
              ≈ ${tesoroEquivalentUSD.toFixed(2)} USD
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => {
                setAdjustAccount('banco_del_tesoro_ves');
                setNewBalanceInput(tesoroVES.toString());
                setAdjustModalOpen(true);
              }}
              className="text-[10px] font-mono text-neutral-300 hover:text-white underline cursor-pointer"
            >
              Ajustar Saldo
            </button>
            <span className="text-[10px] text-sky-400 font-mono">Pago Móvil</span>
          </div>
        </div>

        {/* CARD 4: CAJA EFECTIVO USD (Billetes Físicos en Mano) */}
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                <Banknote size={12} />
                4. Efectivo USD
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 text-[9px] font-mono border border-emerald-400/20">
                Cash Físico
              </span>
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-2 block">
              ${efectivoUSD.toFixed(2)} <span className="text-xs text-neutral-300 font-normal">USD</span>
            </span>
            <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
              Billetes en Mano Taller
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => {
                setAdjustAccount('efectivo_usd');
                setNewBalanceInput(efectivoUSD.toString());
                setAdjustModalOpen(true);
              }}
              className="text-[10px] font-mono text-emerald-300 hover:text-white underline cursor-pointer"
            >
              Ajustar Saldo
            </button>
            <button
              onClick={() => setActiveSubTab('cash_box')}
              className="text-[10px] text-neutral-300 hover:text-emerald-400 font-mono"
            >
              Arqueo →
            </button>
          </div>
        </div>

        {/* CARD 5: CAJA EFECTIVO VES (Billetes en Bolívares) */}
        <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-500/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400 font-bold flex items-center gap-1">
                <Banknote size={12} />
                5. Efectivo Bs
              </span>
              <span className="px-1.5 py-0.5 rounded bg-teal-400/10 text-teal-300 text-[9px] font-mono border border-teal-400/20">
                Bs. Físico
              </span>
            </div>
            <span className="text-2xl font-black text-white font-mono mt-2 block">
              Bs. {efectivoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
              ≈ ${efectivoVESEquivalentUSD.toFixed(2)} USD
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => {
                setAdjustAccount('efectivo_ves');
                setNewBalanceInput(efectivoVES.toString());
                setAdjustModalOpen(true);
              }}
              className="text-[10px] font-mono text-teal-300 hover:text-white underline cursor-pointer"
            >
              Ajustar Saldo
            </button>
            <span className="text-[10px] text-teal-400 font-mono">Billetes</span>
          </div>
        </div>

        {/* CARD 6: CUENTAS POR COBRAR (QUIÉN ME DEBE) */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-purple-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-bold">
                6. Por Cobrar
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-400/10 text-purple-400 text-[9px] font-mono border border-purple-400/20">
                {debts.filter(d => d.status !== 'cobrado').length} Deudas
              </span>
            </div>
            <span className="text-2xl font-black text-purple-300 font-mono mt-2 block">
              ${totalDebtsUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
            </span>
            <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
              ~ Bs. {(totalDebtsUSD * exchangeRateBCV).toFixed(2)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => setActiveSubTab('debts')}
              className="text-[10px] font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer"
            >
              Ver Deudores →
            </button>
            <span className="text-[10px] text-neutral-500 font-mono">Pendiente</span>
          </div>
        </div>

      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-[#0D253A] text-amber-400 shadow-md border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Resumen & Movimientos
        </button>

        <button
          onClick={() => setActiveSubTab('cash_box')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'cash_box'
              ? 'bg-emerald-950 text-emerald-300 shadow-md border border-emerald-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Banknote size={14} className="text-emerald-400" />
          <span>Caja en Efectivo & Arqueo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('debts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'debts'
              ? 'bg-[#0D253A] text-amber-400 shadow-md border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Quién Me Debe ({debts.filter(d => d.status !== 'cobrado').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'transactions'
              ? 'bg-[#0D253A] text-amber-400 shadow-md border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Libro Mayor ({transactions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('closes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'closes'
              ? 'bg-[#0D253A] text-amber-400 shadow-md border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Cierres de Caja ({cashCloses.length})
        </button>
      </div>

      {/* ========================================================== */}
      {/* SECTION 1: OVERVIEW & MOVIMIENTOS RECIENTES               */}
      {/* ========================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
              Últimos Movimientos de Tesorería (Todas las Cuentas)
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Mostrando los últimos 12 registros
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cuenta</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 font-mono">
                {transactions.slice(0, 12).map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-900/40">
                    <td className="py-3 px-4 text-neutral-400">
                      {tx.date ? new Date(tx.date).toLocaleDateString('es-VE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                    </td>
                    <td className="py-3 px-4">
                      {tx.account === 'binance_usdt' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[10px]">Binance (USDT)</span>
                      ) : tx.account === 'banco_del_tesoro_ves' ? (
                        <span className="px-2 py-0.5 rounded bg-sky-400/10 text-sky-400 text-[10px]">Bco. Tesoro (Bs)</span>
                      ) : tx.account === 'efectivo_usd' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 text-[10px]">Efectivo USD</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-teal-400/10 text-teal-400 text-[10px]">Efectivo Bs</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {tx.type === 'ingreso' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <ArrowDownRight size={13} /> + Ingreso
                        </span>
                      ) : tx.type === 'egreso' ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <ArrowUpRight size={13} /> - Egreso
                        </span>
                      ) : tx.type === 'compra_efectivo' || tx.type === 'venta_efectivo' ? (
                        <span className="text-purple-300 font-bold flex items-center gap-1">
                          <Repeat size={13} /> Divisa
                        </span>
                      ) : (
                        <span className="text-amber-300 font-bold">Ajuste</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-neutral-200">
                      {tx.concept}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 uppercase text-[10px]">
                      {tx.category}
                    </td>
                    <td className="py-3 px-4 text-right font-black">
                      <span className={tx.type === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}>
                        {tx.type === 'ingreso' ? '+' : '-'} {tx.amount.toFixed(2)} {tx.account.includes('usd') || tx.account.includes('usdt') ? 'USD' : 'Bs.'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION: CAJA EN EFECTIVO & ARQUEO INTERACTIVO             */}
      {/* ========================================================== */}
      {activeSubTab === 'cash_box' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-brand-heading flex items-center gap-2">
                <Banknote className="text-emerald-400" size={22} />
                Gestión de Caja en Efectivo Físico
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Control de billetes en gaveta del taller, compra/venta de efectivo y arqueo diario sincronizado con Firestore.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTxType('ingreso');
                  setTxAccount('efectivo_usd');
                  setTxModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold uppercase tracking-wider hover:bg-emerald-900"
              >
                + Entrada Efectivo
              </button>
              <button
                onClick={() => {
                  setTxType('egreso');
                  setTxAccount('efectivo_usd');
                  setTxModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-950 text-red-300 border border-red-800 text-xs font-bold uppercase tracking-wider hover:bg-red-900"
              >
                - Salida / Gasto Cash
              </button>
              <button
                onClick={() => setExchangeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold uppercase tracking-wider hover:bg-purple-900"
              >
                Compra/Venta Cash
              </button>
            </div>
          </div>

          {/* Arqueo de Billetes Calculador y Comparador */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Conteo de Billetes USD */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-emerald-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    Contador Rápido de Billetes en Gaveta (Arqueo USD)
                  </span>
                </div>
                <button
                  onClick={() => setBillsCount({ 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 })}
                  className="text-[10px] text-neutral-400 hover:text-white underline font-mono"
                >
                  Reiniciar Conteo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[100, 50, 20, 10, 5, 1].map((denom) => (
                  <div key={denom} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-emerald-400 font-mono block">
                        ${denom} USD
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        Subtotal: ${(denom * (billsCount[denom] || 0)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setBillsCount(prev => ({ ...prev, [denom]: Math.max(0, (prev[denom] || 0) - 1) }))}
                        className="w-6 h-6 rounded bg-neutral-800 text-white font-mono flex items-center justify-center hover:bg-neutral-700"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={billsCount[denom] || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setBillsCount(prev => ({ ...prev, [denom]: val }));
                        }}
                        placeholder="0"
                        className="w-12 p-1 text-center bg-neutral-900 border border-neutral-700 rounded text-xs font-mono text-white"
                      />
                      <button
                        onClick={() => setBillsCount(prev => ({ ...prev, [denom]: (prev[denom] || 0) + 1 }))}
                        className="w-6 h-6 rounded bg-neutral-800 text-white font-mono flex items-center justify-center hover:bg-neutral-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Arqueo Comparison Footer */}
              <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Total Contado en Billetes:</span>
                  <span className="text-xl font-black text-emerald-400">
                    ${calculatedArqueoUSD.toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Saldo Teórico en Sistema:</span>
                  <span className="text-xl font-black text-white">
                    ${efectivoUSD.toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Diferencia:</span>
                  <span className={`text-xl font-black ${
                    Math.abs(calculatedArqueoUSD - efectivoUSD) < 0.01 
                      ? 'text-emerald-400' 
                      : calculatedArqueoUSD > efectivoUSD 
                      ? 'text-sky-400' 
                      : 'text-red-400'
                  }`}>
                    {calculatedArqueoUSD - efectivoUSD >= 0 ? '+' : ''}${(calculatedArqueoUSD - efectivoUSD).toFixed(2)}
                  </span>
                </div>
                {Math.abs(calculatedArqueoUSD - efectivoUSD) > 0.01 && (
                  <button
                    onClick={() => {
                      updateTreasuryBalance('efectivo_usd', calculatedArqueoUSD, `Ajuste por arqueo físico de caja (${new Date().toLocaleDateString('es-VE')})`);
                      showToast(`Saldo de caja sincronizado al monto contado: $${calculatedArqueoUSD.toFixed(2)}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black uppercase"
                  >
                    Cuadrar Caja
                  </button>
                )}
              </div>
            </div>

            {/* Box 2: Resumen Rápido de Efectivo */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-black text-white uppercase tracking-wider font-mono block">
                  Resumen de Fondos Físicos
                </span>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Fondos disponibles para entrega inmediata en taller Caracas.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-mono">Efectivo USD:</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">${efectivoUSD.toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-mono">Efectivo Bs:</span>
                    <span className="text-sm font-black text-teal-400 font-mono">Bs. {efectivoVES.toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">Total Efectivo (USD):</span>
                    <span className="text-base font-black text-emerald-300 font-mono">${totalCashUSD.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <span className="text-[10px] text-neutral-500 font-mono block mb-2">
                  Multi-dispositivo: Cualquier cambio de saldo se replica automáticamente en la nube Firestore.
                </span>
                <button
                  onClick={() => {
                    setAdjustAccount('efectivo_usd');
                    setNewBalanceInput(efectivoUSD.toString());
                    setAdjustModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Ajuste Directo de Saldo USD
                </button>
              </div>
            </div>

          </div>

          {/* Historial de Movimientos de Efectivo Físico */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Historial Específico de Movimientos en Efectivo ({cashOnlyTxs.length})
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Moneda</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {cashOnlyTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-900/40">
                      <td className="py-3 px-4 text-neutral-400">
                        {tx.date ? new Date(tx.date).toLocaleDateString('es-VE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                      </td>
                      <td className="py-3 px-4">
                        {tx.account === 'efectivo_usd' ? (
                          <span className="text-emerald-400 font-bold">$ USD Billetes</span>
                        ) : (
                          <span className="text-teal-400 font-bold">Bs. Bolívares</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {tx.type === 'ingreso' ? (
                          <span className="text-emerald-400 font-bold">+ Entrada</span>
                        ) : tx.type === 'egreso' ? (
                          <span className="text-red-400 font-bold">- Salida</span>
                        ) : (
                          <span className="text-purple-300 font-bold">Operación Divisa</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-neutral-200">
                        {tx.concept}
                      </td>
                      <td className="py-3 px-4 text-right font-black">
                        <span className={tx.type === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}>
                          {tx.type === 'ingreso' ? '+' : '-'} {tx.amount.toFixed(2)} {tx.account === 'efectivo_usd' ? 'USD' : 'Bs.'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {cashOnlyTxs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono text-xs">
                        No hay movimientos de caja en efectivo registrados todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 2: QUIÉN ME DEBE (CUENTAS POR COBRAR)             */}
      {/* ========================================================== */}
      {activeSubTab === 'debts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Control de Cuentas por Cobrar ("Quién Me Debe")
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Lleva el control de pedidos fiados, abonos parciales o pagos pendientes de clientes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar deudor o teléfono..."
                  value={debtSearch}
                  onChange={(e) => setDebtSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <button
                onClick={() => setDebtModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                + Nueva Deuda
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Deudor</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Concepto / Motivo</th>
                  <th className="py-3 px-4">Total Deuda</th>
                  <th className="py-3 px-4">Abonado</th>
                  <th className="py-3 px-4">Resta por Cobrar</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono">
                {filteredDebts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-neutral-900/40">
                    <td className="py-3 px-4 font-bold text-white font-sans">
                      {debt.debtorName}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      <a href={`https://wa.me/${debt.debtorPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline">
                        {debt.debtorPhone}
                      </a>
                    </td>
                    <td className="py-3 px-4 font-sans text-neutral-300">
                      {debt.concept}
                      {debt.notes && (
                        <span className="block text-[10px] text-neutral-500 italic">{debt.notes}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-bold">
                      ${debt.totalUSD.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-emerald-400">
                      ${debt.paidUSD.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-purple-300 font-black">
                      ${debt.remainingUSD.toFixed(2)}
                      <span className="block text-[9px] text-neutral-500 font-normal">
                        ≈ Bs. {(debt.remainingUSD * exchangeRateBCV).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {debt.status === 'cobrado' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                          Cobrado
                        </span>
                      ) : debt.status === 'abonado' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px]">
                          Abonado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px]">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {debt.status !== 'cobrado' && (
                        <button
                          onClick={() => {
                            setSelectedDebt(debt);
                            setPaymentAmountUSD(debt.remainingUSD.toString());
                            setPaymentDebtModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase cursor-pointer"
                          title="Registrar Abono"
                        >
                          Abonar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar registro de deuda de ${debt.debtorName}?`)) {
                            deleteDebt(debt.id);
                          }
                        }}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Eliminar registro"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 3: LIBRO MAYOR COMPLETO                           */}
      {/* ========================================================== */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Libro Mayor de Transacciones
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Historial completo de entradas y salidas de las cuentas oficiales de la marca.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={txFilterAccount}
                onChange={(e) => setTxFilterAccount(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
              >
                <option value="todas">Todas las Cuentas</option>
                <option value="binance_usdt">Solo Binance (USDT)</option>
                <option value="banco_del_tesoro_ves">Solo Banco del Tesoro (Bs)</option>
                <option value="efectivo_usd">Solo Efectivo USD</option>
                <option value="efectivo_ves">Solo Efectivo Bs</option>
              </select>

              <select
                value={txFilterType}
                onChange={(e) => setTxFilterType(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
              >
                <option value="todos">Todos los Tipos</option>
                <option value="ingreso">Solo Ingresos</option>
                <option value="egreso">Solo Egresos</option>
                <option value="compra_efectivo">Solo Compra Efectivo</option>
                <option value="venta_efectivo">Solo Venta Efectivo</option>
                <option value="ajuste">Solo Ajustes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cuenta</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Registrado Por</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-900/40">
                    <td className="py-3 px-4 text-neutral-400">
                      {tx.date ? new Date(tx.date).toLocaleDateString('es-VE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                    </td>
                    <td className="py-3 px-4">
                      {tx.account === 'binance_usdt' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[10px]">Binance (USDT)</span>
                      ) : tx.account === 'banco_del_tesoro_ves' ? (
                        <span className="px-2 py-0.5 rounded bg-sky-400/10 text-sky-400 text-[10px]">Bco. Tesoro (Bs)</span>
                      ) : tx.account === 'efectivo_usd' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 text-[10px]">Efectivo USD</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-teal-400/10 text-teal-400 text-[10px]">Efectivo Bs</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {tx.type === 'ingreso' ? (
                        <span className="text-emerald-400 font-bold">+ Ingreso</span>
                      ) : tx.type === 'egreso' ? (
                        <span className="text-red-400 font-bold">- Egreso</span>
                      ) : (
                        <span className="text-purple-300 font-bold">Divisa / Op</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-neutral-200">
                      {tx.concept}
                      {tx.relatedOrderCode && (
                        <span className="text-[10px] text-amber-400 ml-2 font-mono">({tx.relatedOrderCode})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 uppercase text-[10px]">
                      {tx.category}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-[10px]">
                      {tx.registeredBy || 'Admin'}
                    </td>
                    <td className="py-3 px-4 text-right font-black">
                      <span className={tx.type === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}>
                        {tx.type === 'ingreso' ? '+' : '-'} {tx.amount.toFixed(2)} {tx.account.includes('usd') || tx.account.includes('usdt') ? 'USD' : 'Bs.'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 4: HISTORIAL DE CIERRES DE CAJA                   */}
      {/* ========================================================== */}
      {activeSubTab === 'closes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Historial de Cierres Diarios de Caja
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Comprobantes de arqueo de caja emitidos al final de cada jornada de taller.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cashCloses.map((close) => (
              <div key={close.id} className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-sm font-black text-white font-mono block">
                      CIERRE DE CAJA: {close.date}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Cerrado por: {close.closedBy} • {new Date(close.closedAt).toLocaleTimeString('es-VE')}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 text-xs font-mono font-bold border border-amber-400/20">
                    ${close.totalUSD.toFixed(2)} USD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">En Binance Pay:</span>
                    <span className="text-amber-400 font-bold text-sm">${(close.binanceUSD || 0).toFixed(2)} USDT</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">En Banco del Tesoro:</span>
                    <span className="text-sky-400 font-bold text-sm">Bs. {(close.tesoroVES || 0).toFixed(2)}</span>
                  </div>
                </div>

                {close.notes && (
                  <p className="text-xs text-neutral-300 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 font-sans">
                    "{close.notes}"
                  </p>
                )}
              </div>
            ))}

            {cashCloses.length === 0 && (
              <div className="col-span-2 py-12 text-center text-neutral-500 text-xs font-mono">
                No hay cierres de caja archivados aún. Puedes realizar un arqueo en la pestaña superior.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 1: AJUSTE MANUAL DE SALDO                           */}
      {/* ========================================================== */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Ajustar Saldo de Cuenta
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Cuenta a Ajustar:</label>
                <select
                  value={adjustAccount}
                  onChange={(e) => setAdjustAccount(e.target.value as any)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                >
                  <option value="efectivo_usd">Caja Efectivo USD (Físico en Mano)</option>
                  <option value="efectivo_ves">Caja Efectivo Bs. (Billetes Físicos)</option>
                  <option value="binance_usdt">Binance Pay (USDT Digital)</option>
                  <option value="banco_del_tesoro_ves">Banco del Tesoro (Bolívares Cuenta 0163)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">
                  Nuevo Saldo Real ({adjustAccount.includes('usd') || adjustAccount.includes('usdt') ? 'USD / USDT' : 'Bolívares Bs.'}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Motivo del Ajuste (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. Cuadre de caja físico / Comisión bancaria"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-black uppercase tracking-wider"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: REGISTRAR INGRESO / EGRESO MANUAL                 */}
      {/* ========================================================== */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Registrar {txType === 'ingreso' ? 'Ingreso a Caja' : 'Retiro / Egreso'}
              </h3>
              <button onClick={() => setTxModalOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Cuenta:</label>
                <select
                  value={txAccount}
                  onChange={(e) => setTxAccount(e.target.value as any)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                >
                  <option value="efectivo_usd">Caja Efectivo USD ($ billetes)</option>
                  <option value="efectivo_ves">Caja Efectivo Bs. (Billetes físicos)</option>
                  <option value="binance_usdt">Binance Pay (USDT)</option>
                  <option value="banco_del_tesoro_ves">Banco del Tesoro (Bolívares)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">
                  Monto ({txAccount.includes('usd') || txAccount.includes('usdt') ? 'USD / USDT' : 'Bs.'}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Concepto o Descripción:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra de rollos de tela rib / Pago de delivery motorizado"
                  value={txConcept}
                  onChange={(e) => setTxConcept(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Categoría:</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                >
                  <option value="proveedor">Proveedor de tela o insumos</option>
                  <option value="gasto_operativo">Gasto operativo / Taller</option>
                  <option value="retiro">Retiro personal de socios</option>
                  <option value="pedido">Cobro de pedido directo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider ${
                    txType === 'ingreso' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: COMPRA / VENTA / CAMBIO DE EFECTIVO                */}
      {/* ========================================================== */}
      {exchangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat size={18} className="text-purple-400" />
                <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                  Compra / Venta de Efectivo Físico
                </h3>
              </div>
              <button onClick={() => setExchangeModalOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-neutral-400">
              Registra el intercambio entre cuentas. Por ejemplo: pagar Bs. desde el Banco del Tesoro para comprar billetes USD en efectivo, o vender USD en efectivo para fondear Binance.
            </p>

            <form onSubmit={handleSaveExchange} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Tipo de Operación:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExchangeType('compra_efectivo');
                      setExchangeTargetAcc('efectivo_usd');
                      setExchangeSourceAcc('banco_del_tesoro_ves');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                      exchangeType === 'compra_efectivo'
                        ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    Comprar Efectivo USD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExchangeType('venta_efectivo');
                      setExchangeSourceAcc('efectivo_usd');
                      setExchangeTargetAcc('binance_usdt');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                      exchangeType === 'venta_efectivo'
                        ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    Vender Efectivo USD
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Cuenta de Origen (Entrega):</label>
                  <select
                    value={exchangeSourceAcc}
                    onChange={(e) => setExchangeSourceAcc(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    <option value="banco_del_tesoro_ves">Banco del Tesoro (Bs)</option>
                    <option value="binance_usdt">Binance Pay (USDT)</option>
                    <option value="efectivo_usd">Caja Efectivo USD</option>
                    <option value="efectivo_ves">Caja Efectivo Bs</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Cuenta de Destino (Recibe):</label>
                  <select
                    value={exchangeTargetAcc}
                    onChange={(e) => setExchangeTargetAcc(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    <option value="efectivo_usd">Caja Efectivo USD</option>
                    <option value="efectivo_ves">Caja Efectivo Bs</option>
                    <option value="binance_usdt">Binance Pay (USDT)</option>
                    <option value="banco_del_tesoro_ves">Banco del Tesoro (Bs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Monto en Divisa ($ USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 100.00"
                    value={exchangeAmount}
                    onChange={(e) => setExchangeAmount(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Tasa de Cambio Pactada (Bs/$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={exchangeRateCustom}
                    onChange={(e) => setExchangeRateCustom(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Detalle o Motivo:</label>
                <input
                  type="text"
                  placeholder="Ej. Compra de $100 efectivo a tasa BCV para pago de costurera"
                  value={exchangeConcept}
                  onChange={(e) => setExchangeConcept(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExchangeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider"
                >
                  Ejecutar Operación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: REGISTRAR NUEVA DEUDA                             */}
      {/* ========================================================== */}
      {debtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Registrar Cuenta por Cobrar
              </h3>
              <button onClick={() => setDebtModalOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Nombre del Deudor / Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Teléfono WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 0412-1234567"
                  value={debtorPhone}
                  onChange={(e) => setDebtorPhone(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Monto de la Deuda ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={debtTotalUSD}
                  onChange={(e) => setDebtTotalUSD(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-amber-400"
                />
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                  Equivalente: ~ Bs. {((parseFloat(debtTotalUSD) || 0) * exchangeRateBCV).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Concepto de la Deuda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Quedó debiendo 1 franela oversize / Abonó la mitad"
                  value={debtConcept}
                  onChange={(e) => setDebtConcept(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Notas / Fecha de Cobro Prometida</label>
                <input
                  type="text"
                  placeholder="Ej. Paga el próximo viernes al retirar en taller"
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDebtModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-black uppercase tracking-wider"
                >
                  Registrar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: REGISTRAR ABONO / PAGO DE DEUDA                   */}
      {/* ========================================================== */}
      {paymentDebtModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Registrar Abono de Deuda
              </h3>
              <button onClick={() => setPaymentDebtModalOpen(false)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs space-y-1">
              <p><strong className="text-white">Deudor:</strong> {selectedDebt.debtorName}</p>
              <p><strong className="text-white">Resta pendiente:</strong> ${selectedDebt.remainingUSD.toFixed(2)} USD</p>
            </div>

            <form onSubmit={handleSaveDebtPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Monto que está Abonando ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedDebt.remainingUSD}
                  required
                  value={paymentAmountUSD}
                  onChange={(e) => setPaymentAmountUSD(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">Cuenta donde se acreditó el pago:</label>
                <select
                  value={paymentTargetAccount}
                  onChange={(e) => setPaymentTargetAccount(e.target.value as any)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                >
                  <option value="efectivo_usd">Caja Efectivo USD (Físico en Mano)</option>
                  <option value="efectivo_ves">Caja Efectivo Bs. (Billetes)</option>
                  <option value="banco_del_tesoro_ves">Banco del Tesoro (Pago Móvil Bs.)</option>
                  <option value="binance_usdt">Binance Pay (USDT)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentDebtModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider"
                >
                  Registrar Abono y Acreditar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
