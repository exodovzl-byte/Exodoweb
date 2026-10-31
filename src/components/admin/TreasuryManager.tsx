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
  Calculator,
  PieChart,
  Users,
  Package,
  Wrench,
  Shield,
  HeartHandshake,
  Percent,
  Calendar,
  ArrowRight,
  UserCheck
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
    exchangeRateBCV,
    orders,
    partnerWithdrawals,
    recordPartnerWithdrawal,
    getMonthlyFinancialSummary,
    availableFinancialMonths
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'financial_split' | 'cash_box' | 'debts' | 'transactions' | 'closes'>('financial_split');

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

  // Financial Percentage Split State (Reglas 40% - 30% - 15% - 10% - 5%)
  const [selectedFinancialMonth, setSelectedFinancialMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalPartner, setWithdrawalPartner] = useState<'Andres' | 'Valeria' | 'Ambos'>('Andres');
  const [withdrawalAmountInput, setWithdrawalAmountInput] = useState('');
  const [withdrawalAccount, setWithdrawalAccount] = useState<'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'>('binance_usdt');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');

  const currentFinancialSummary = getMonthlyFinancialSummary(selectedFinancialMonth);

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

  // Submit Partner Salary Withdrawal (Cierre / Retiro de Sueldos)
  const handleSavePartnerWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmountInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingresa un monto válido mayor a $0.');
      return;
    }

    const maxAvailable = withdrawalPartner === 'Andres' 
      ? currentFinancialSummary.balanceAvailableAndresUSD
      : withdrawalPartner === 'Valeria'
      ? currentFinancialSummary.balanceAvailableValeriaUSD
      : currentFinancialSummary.balanceAvailableAndresUSD + currentFinancialSummary.balanceAvailableValeriaUSD;

    if (amount > maxAvailable + 0.01) {
      const confirmExceed = window.confirm(
        `El monto ingresado ($${amount.toFixed(2)} USD) supera el saldo disponible actual ($${maxAvailable.toFixed(2)} USD) para ${withdrawalPartner}. ¿Deseas procesar el retiro como anticipo de sueldo?`
      );
      if (!confirmExceed) return;
    }

    recordPartnerWithdrawal({
      partner: withdrawalPartner,
      amountUSD: amount,
      account: withdrawalAccount,
      notes: withdrawalNotes,
      registeredBy: 'Administrador',
    });

    const accountNames = {
      binance_usdt: 'Binance Pay (USDT)',
      banco_del_tesoro_ves: 'Banco del Tesoro (Bs.)',
      efectivo_usd: 'Caja Efectivo ($ USD)',
      efectivo_ves: 'Caja Efectivo (Bs.)',
    };

    showToast(`¡Cierre / Retiro de $${amount.toFixed(2)} USD procesado con éxito para ${withdrawalPartner} (${accountNames[withdrawalAccount]})!`);
    setWithdrawalModalOpen(false);
    setWithdrawalAmountInput('');
    setWithdrawalNotes('');
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
                setWithdrawalPartner('Ambos');
                setWithdrawalAmountInput('');
                setWithdrawalModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              <Users size={14} />
              <span>Cierre / Retiro de Sueldos</span>
            </button>

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
          onClick={() => setActiveSubTab('financial_split')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'financial_split'
              ? 'bg-amber-400 text-black shadow-lg font-black border border-amber-300'
              : 'text-amber-400 hover:text-white bg-amber-400/10 border border-amber-400/20'
          }`}
        >
          <PieChart size={14} />
          <span>Control Financiero (%)</span>
        </button>

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
      {/* SECTION: CONTROL FINANCIERO POR PORCENTAJES (100% PEDIDOS) */}
      {/* ========================================================== */}
      {activeSubTab === 'financial_split' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Top Period Selector & Action Bar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <PieChart size={18} />
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-brand-heading">
                  Distribución Financiera del 100% de Pedidos
                </h3>
              </div>
              <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                Cada pedido registrado se divide matemáticamente en tiempo real: <strong className="text-blue-400">40% Insumos/Operación</strong>, <strong className="text-emerald-400">30% Sueldo de Socios (15% Andrés y 15% Valeria)</strong>, <strong className="text-amber-400">15% Equipos</strong>, <strong className="text-purple-400">10% Ahorro Devaluación</strong> y <strong className="text-rose-400">5% Donativos</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Month Selector */}
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-750 px-3 py-2 rounded-xl">
                <Calendar size={14} className="text-amber-400 shrink-0" />
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Mes:</label>
                <select
                  value={selectedFinancialMonth}
                  onChange={(e) => setSelectedFinancialMonth(e.target.value)}
                  className="bg-transparent text-amber-400 text-xs font-bold font-mono focus:outline-none cursor-pointer"
                >
                  {availableFinancialMonths.map((m) => (
                    <option key={m.key} value={m.key} className="bg-neutral-900 text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button: Cierre / Retiro de Sueldos */}
              <button
                type="button"
                onClick={() => {
                  setWithdrawalPartner('Ambos');
                  setWithdrawalAmountInput('');
                  setWithdrawalModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] cursor-pointer"
              >
                <Users size={16} />
                <span>Cierre / Retiro de Sueldos</span>
              </button>
            </div>
          </div>

          {/* Period Grand Summary Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Total Facturado en Pedidos ({currentFinancialSummary.monthLabel})
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                ${currentFinancialSummary.totalOrdersRevenueUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                ~ Bs. {currentFinancialSummary.totalOrdersRevenueVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Pedidos Registrados en el Periodo
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {currentFinancialSummary.ordersCount} <span className="text-xs text-neutral-400 font-normal">pedidos activos</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                Tasa BCV Referencia: Bs. {exchangeRateBCV.toFixed(2)}/$
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
              <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold block">
                Saldo Total Disponible Socios (Sin Retirar)
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                ${(currentFinancialSummary.balanceAvailableAndresUSD + currentFinancialSummary.balanceAvailableValeriaUSD).toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
              </span>
              <span className="text-xs text-emerald-300/80 font-mono mt-0.5 block">
                Andrés: ${currentFinancialSummary.balanceAvailableAndresUSD.toFixed(2)} • Valeria: ${currentFinancialSummary.balanceAvailableValeriaUSD.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 100% Visual Proportional Distribution Bar */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400 uppercase font-bold flex items-center gap-1.5">
                <Percent size={14} className="text-amber-400" />
                Distribución Proporcional Automática (100%):
              </span>
              <span className="text-amber-400 font-bold">Total: 100.0%</span>
            </div>

            <div className="w-full h-6 rounded-xl overflow-hidden flex bg-neutral-900 border border-neutral-800">
              <div style={{ width: '40%' }} className="bg-blue-600 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all" title="Insumos y Operación (40%)">
                40%
              </div>
              <div style={{ width: '15%' }} className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-black transition-all" title="Sueldo Andrés (15%)">
                15%
              </div>
              <div style={{ width: '15%' }} className="bg-teal-400 h-full flex items-center justify-center text-[10px] font-mono font-bold text-black transition-all" title="Sueldo Valeria (15%)">
                15%
              </div>
              <div style={{ width: '15%' }} className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-mono font-bold text-black transition-all" title="Equipos y Herramientas (15%)">
                15%
              </div>
              <div style={{ width: '10%' }} className="bg-purple-600 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all" title="Reserva / Ahorro (10%)">
                10%
              </div>
              <div style={{ width: '5%' }} className="bg-rose-500 h-full flex items-center justify-center text-[9px] font-mono font-bold text-white transition-all" title="Donativos y Marca (5%)">
                5%
              </div>
            </div>

            {/* Legend Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 shrink-0"></span>
                <span className="text-neutral-300 truncate">40% Insumos</span>
                <span className="text-white font-bold ml-auto">${currentFinancialSummary.insumosOperacionAccumulatedUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0"></span>
                <span className="text-neutral-300 truncate">15% Andrés</span>
                <span className="text-white font-bold ml-auto">${currentFinancialSummary.sueldoAndresAccumulatedUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-400 shrink-0"></span>
                <span className="text-neutral-300 truncate">15% Valeria</span>
                <span className="text-white font-bold ml-auto">${currentFinancialSummary.sueldoValeriaAccumulatedUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0"></span>
                <span className="text-neutral-300 truncate">15% Equipos</span>
                <span className="text-white font-bold ml-auto">${currentFinancialSummary.equiposHerramientasAccumulatedUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 shrink-0"></span>
                <span className="text-neutral-300 truncate">10% Ahorro</span>
                <span className="text-white font-bold ml-auto">${currentFinancialSummary.reservaAhorroAccumulatedUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0"></span>
                <span className="text-neutral-300 truncate">5% Donativos</span>
                <span className="text-white font-bold ml-auto">${currentFinancialSummary.donativosMarcaAccumulatedUSD.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 6 Real-Time Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. INSUMOS Y OPERACIÓN (40%) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-blue-950/20 border border-blue-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                    <Package size={15} />
                    1. Insumos y Operación (40%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                    40.0%
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white font-mono block">
                    ${currentFinancialSummary.insumosOperacionAccumulatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                  <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                    ~ Bs. {(currentFinancialSummary.insumosOperacionAccumulatedUSD * exchangeRateBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  Fondo reservado para compra de franelas 100% algodón pesado 240g, vinil y film DTF textil, tintas, tote bags, láminas, empaques y envíos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Destino: Proveedores y Taller</span>
                <span className="text-blue-400 font-bold">Activo</span>
              </div>
            </div>

            {/* 2. SUELDO SOCIO: ANDRÉS (15%) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-emerald-950/30 border border-emerald-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    <Users size={15} />
                    2. Sueldo Andrés (15%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    50% de Socios
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-neutral-400 font-mono block">Generado en el periodo:</span>
                  <span className="text-2xl font-black text-white font-mono block">
                    ${currentFinancialSummary.sueldoAndresAccumulatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">Retirado:</span>
                      <span className="text-neutral-300">${currentFinancialSummary.withdrawnAndresUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold mt-1 pt-1 border-t border-emerald-800/60">
                      <span className="text-emerald-300">Saldo Disponible:</span>
                      <span className="text-emerald-400 text-sm font-black">${currentFinancialSummary.balanceAvailableAndresUSD.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawalPartner('Andres');
                    setWithdrawalAmountInput(currentFinancialSummary.balanceAvailableAndresUSD > 0 ? currentFinancialSummary.balanceAvailableAndresUSD.toString() : '');
                    setWithdrawalModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <DollarSign size={13} />
                  <span>Retirar Sueldo Andrés</span>
                </button>
              </div>
            </div>

            {/* 3. SUELDO SOCIA: VALERIA (15%) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-teal-950/30 border border-teal-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-teal-300">
                    <Users size={15} />
                    3. Sueldo Valeria (15%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/30">
                    50% de Socios
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-neutral-400 font-mono block">Generado en el periodo:</span>
                  <span className="text-2xl font-black text-white font-mono block">
                    ${currentFinancialSummary.sueldoValeriaAccumulatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                  <div className="mt-2 p-2.5 rounded-xl bg-teal-950/60 border border-teal-800/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">Retirado:</span>
                      <span className="text-neutral-300">${currentFinancialSummary.withdrawnValeriaUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold mt-1 pt-1 border-t border-teal-800/60">
                      <span className="text-teal-300">Saldo Disponible:</span>
                      <span className="text-teal-300 text-sm font-black">${currentFinancialSummary.balanceAvailableValeriaUSD.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawalPartner('Valeria');
                    setWithdrawalAmountInput(currentFinancialSummary.balanceAvailableValeriaUSD > 0 ? currentFinancialSummary.balanceAvailableValeriaUSD.toString() : '');
                    setWithdrawalModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <DollarSign size={13} />
                  <span>Retirar Sueldo Valeria</span>
                </button>
              </div>
            </div>

            {/* 4. EQUIPOS Y HERRAMIENTAS (15%) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-amber-950/20 border border-amber-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    <Wrench size={15} />
                    4. Equipos y Herramientas (15%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    15.0%
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white font-mono block">
                    ${currentFinancialSummary.equiposHerramientasAccumulatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                  <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                    ~ Bs. {(currentFinancialSummary.equiposHerramientasAccumulatedUSD * exchangeRateBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  Fondo acumulativo para mantenimiento preventivo de planchas térmicas de sublimación, calibración de cabezales, repuestos y renovación tecnológica de taller.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Destino: Taller & Maquinaria</span>
                <span className="text-amber-400 font-bold">Reserva de Activos</span>
              </div>
            </div>

            {/* 5. RESERVA / AHORRO DEVALUACIÓN (10%) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-purple-950/20 border border-purple-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                    <Shield size={15} />
                    5. Reserva / Ahorro (10%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                    10.0%
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white font-mono block">
                    ${currentFinancialSummary.reservaAhorroAccumulatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                  <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                    ~ Bs. {(currentFinancialSummary.reservaAhorroAccumulatedUSD * exchangeRateBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  Colchón de seguridad y contingencia ante incrementos de la tasa oficial del BCV, inflación de materias primas o emergencias operativas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Destino: Fondo de Estabilidad</span>
                <span className="text-purple-400 font-bold">Blindaje Cambiario</span>
              </div>
            </div>

            {/* 6. DONATIVOS Y FONDO DE LA MARCA (5%) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-rose-950/20 border border-rose-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                    <HeartHandshake size={15} />
                    6. Donativos & Propósito (5%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                    5.0%
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white font-mono block">
                    ${currentFinancialSummary.donativosMarcaAccumulatedUSD.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                  <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                    ~ Bs. {(currentFinancialSummary.donativosMarcaAccumulatedUSD * exchangeRateBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  Siembra y donativos para misiones cristianas, evangelismo en calles caraqueñas, donación de prendas y apoyo comunitario bajo #DiosFueraDelTemplo.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Destino: Misiones & Siembra</span>
                <span className="text-rose-400 font-bold">Propósito del Reino</span>
              </div>
            </div>

          </div>

          {/* HISTORIAL DE CIERRES Y RETIROS DE SUELDOS */}
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-tight font-brand-heading flex items-center gap-2">
                  <UserCheck size={18} className="text-emerald-400" />
                  Historial de Cierres y Retiros de Sueldos de Socios
                </h4>
                <p className="text-xs text-neutral-400">
                  Registro cronológico de los desembolsos de sueldos para Andrés y Valeria
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWithdrawalPartner('Ambos');
                  setWithdrawalAmountInput('');
                  setWithdrawalModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-400 border border-neutral-750 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Registrar Nuevo Retiro</span>
              </button>
            </div>

            {partnerWithdrawals.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 font-mono text-xs">
                No hay retiros de sueldos registrados todavía. Los saldos generados por cada pedido permanecen acumulados como saldo disponible.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-850">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Socio(s)</th>
                      <th className="py-3 px-4">Monto USD</th>
                      <th className="py-3 px-4">Equiv. Bolívares</th>
                      <th className="py-3 px-4">Cuenta Desembolso</th>
                      <th className="py-3 px-4">Concepto / Notas</th>
                      <th className="py-3 px-4">Registrado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850/80">
                    {partnerWithdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-neutral-900/40">
                        <td className="py-3 px-4 text-neutral-400">
                          {new Date(w.date).toLocaleDateString('es-VE', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            w.partner === 'Andres'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : w.partner === 'Valeria'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {w.partner === 'Ambos' ? 'Andrés & Valeria (50/50)' : w.partner}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          ${w.amountUSD.toFixed(2)} USD
                        </td>
                        <td className="py-3 px-4 text-neutral-400">
                          Bs. {(w.amountVES || (w.amountUSD * exchangeRateBCV)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {w.account === 'binance_usdt' ? 'Binance Pay (USDT)' :
                           w.account === 'banco_del_tesoro_ves' ? 'Banco del Tesoro (Bs.)' :
                           w.account === 'efectivo_usd' ? 'Caja Efectivo ($ USD)' : 'Caja Efectivo (Bs.)'}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 max-w-xs truncate" title={w.notes || w.concept}>
                          {w.notes || w.concept}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {w.registeredBy || 'Admin'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AUDITORÍA DETALLADA: DESGLOSE POR PEDIDO EN EL PERIODO */}
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-tight font-brand-heading flex items-center gap-2">
                  <FileText size={18} className="text-amber-400" />
                  Auditoría por Pedido: Distribución 100% ({currentFinancialSummary.monthLabel})
                </h4>
                <p className="text-xs text-neutral-400">
                  Desglose matemático individual calculado sobre cada pedido registrado
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {orders.filter(o => o.status !== 'cancelado' && (selectedFinancialMonth === 'historico' || (o.createdAt && o.createdAt.startsWith(selectedFinancialMonth)))).length} pedidos en este periodo
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-850">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-3">Pedido</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3 text-right">Total (100%)</th>
                    <th className="py-3 px-3 text-right text-blue-400">Insumos (40%)</th>
                    <th className="py-3 px-3 text-right text-emerald-400">Andrés (15%)</th>
                    <th className="py-3 px-3 text-right text-teal-400">Valeria (15%)</th>
                    <th className="py-3 px-3 text-right text-amber-400">Equipos (15%)</th>
                    <th className="py-3 px-3 text-right text-purple-400">Ahorro (10%)</th>
                    <th className="py-3 px-3 text-right text-rose-400">Donativo (5%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850/80">
                  {orders
                    .filter(o => o.status !== 'cancelado' && (selectedFinancialMonth === 'historico' || (o.createdAt && o.createdAt.startsWith(selectedFinancialMonth))))
                    .map((ord) => {
                      const total = Number(ord.totalUSD) || 0;
                      const split = ord.financialSplit || {
                        insumosOperacionUSD: total * 0.40,
                        sueldoAndresUSD: total * 0.15,
                        sueldoValeriaUSD: total * 0.15,
                        equiposHerramientasUSD: total * 0.15,
                        reservaAhorroUSD: total * 0.10,
                        donativosMarcaUSD: total * 0.05,
                      };
                      return (
                        <tr key={ord.orderCode} className="hover:bg-neutral-900/40">
                          <td className="py-3 px-3 font-bold text-amber-400">
                            {ord.orderCode}
                          </td>
                          <td className="py-3 px-3 text-neutral-300 truncate max-w-[140px]" title={ord.customerName}>
                            {ord.customerName}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-white">
                            ${total.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-blue-300">
                            ${split.insumosOperacionUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-emerald-300 font-bold">
                            ${split.sueldoAndresUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-teal-300 font-bold">
                            ${split.sueldoValeriaUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-300">
                            ${split.equiposHerramientasUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-purple-300">
                            ${split.reservaAhorroUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-rose-300">
                            ${split.donativosMarcaUSD.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

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

      {/* ========================================================== */}
      {/* MODAL 5: CIERRE / RETIRO DE SUELDO DE SOCIOS               */}
      {/* ========================================================== */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                    Cierre / Retiro de Sueldos de Socios
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Desembolsa fondos del 30% asignado a Andrés y Valeria (50/50)
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setWithdrawalModalOpen(false)} 
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartnerWithdrawal} className="space-y-4">
              {/* Selector de Socio */}
              <div>
                <label className="text-xs font-mono font-bold uppercase text-neutral-300 block mb-2">
                  1. Seleccionar Socio Destinatario:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawalPartner('Andres');
                      if (currentFinancialSummary.balanceAvailableAndresUSD > 0) {
                        setWithdrawalAmountInput(currentFinancialSummary.balanceAvailableAndresUSD.toFixed(2));
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      withdrawalPartner === 'Andres'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase block font-bold text-emerald-400">15% Sueldo</span>
                    <span className="text-sm font-black block mt-0.5">Andrés</span>
                    <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                      Disp: <strong className="text-white">${currentFinancialSummary.balanceAvailableAndresUSD.toFixed(2)}</strong>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawalPartner('Valeria');
                      if (currentFinancialSummary.balanceAvailableValeriaUSD > 0) {
                        setWithdrawalAmountInput(currentFinancialSummary.balanceAvailableValeriaUSD.toFixed(2));
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      withdrawalPartner === 'Valeria'
                        ? 'bg-teal-950/80 border-teal-400 text-white shadow-lg shadow-teal-950/40'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase block font-bold text-teal-300">15% Sueldo</span>
                    <span className="text-sm font-black block mt-0.5">Valeria</span>
                    <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                      Disp: <strong className="text-white">${currentFinancialSummary.balanceAvailableValeriaUSD.toFixed(2)}</strong>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawalPartner('Ambos');
                      const totalBoth = currentFinancialSummary.balanceAvailableAndresUSD + currentFinancialSummary.balanceAvailableValeriaUSD;
                      if (totalBoth > 0) {
                        setWithdrawalAmountInput(totalBoth.toFixed(2));
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      withdrawalPartner === 'Ambos'
                        ? 'bg-amber-950/80 border-amber-400 text-white shadow-lg shadow-amber-950/40'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase block font-bold text-amber-400">30% Total</span>
                    <span className="text-sm font-black block mt-0.5">Ambos (50/50)</span>
                    <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                      Disp: <strong className="text-white">${(currentFinancialSummary.balanceAvailableAndresUSD + currentFinancialSummary.balanceAvailableValeriaUSD).toFixed(2)}</strong>
                    </span>
                  </button>
                </div>
              </div>

              {/* Monto del Retiro */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                    2. Monto a Retirar ($ USD): *
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Saldo Disponible: <strong className="text-emerald-400">
                      ${(withdrawalPartner === 'Andres' 
                        ? currentFinancialSummary.balanceAvailableAndresUSD 
                        : withdrawalPartner === 'Valeria' 
                        ? currentFinancialSummary.balanceAvailableValeriaUSD 
                        : (currentFinancialSummary.balanceAvailableAndresUSD + currentFinancialSummary.balanceAvailableValeriaUSD)
                      ).toFixed(2)} USD
                    </strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-amber-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={withdrawalAmountInput}
                    onChange={(e) => setWithdrawalAmountInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-base font-mono font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Botones de Monto Rápido */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const max = withdrawalPartner === 'Andres' 
                        ? currentFinancialSummary.balanceAvailableAndresUSD 
                        : withdrawalPartner === 'Valeria' 
                        ? currentFinancialSummary.balanceAvailableValeriaUSD 
                        : (currentFinancialSummary.balanceAvailableAndresUSD + currentFinancialSummary.balanceAvailableValeriaUSD);
                      setWithdrawalAmountInput(max > 0 ? max.toFixed(2) : '0');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono font-bold text-amber-400 transition-all cursor-pointer"
                  >
                    Todo el Disponible
                  </button>
                  {['20', '50', '100', '150', '200'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawalAmountInput(amt)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
                    >
                      ${amt}
                    </button>
                  ))}
                  <span className="text-[11px] font-mono text-neutral-400 ml-auto">
                    ~ Bs. {((parseFloat(withdrawalAmountInput) || 0) * exchangeRateBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Cuenta de Origen del Desembolso */}
              <div>
                <label className="text-xs font-mono font-bold uppercase text-neutral-300 block mb-1.5">
                  3. Cuenta de Tesorería donde se Desembolsan los Fondos: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'binance_usdt', label: 'Binance Pay (USDT)', bal: `${treasuryAccounts.binanceUSDT.toFixed(2)} USDT` },
                    { key: 'efectivo_usd', label: 'Caja Efectivo USD (Físico)', bal: `$${treasuryAccounts.efectivoUSD.toFixed(2)} USD` },
                    { key: 'banco_del_tesoro_ves', label: 'Banco del Tesoro (Bs.)', bal: `Bs. ${treasuryAccounts.bancoDelTesoroVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` },
                    { key: 'efectivo_ves', label: 'Caja Efectivo Bs. (Billetes)', bal: `Bs. ${treasuryAccounts.efectivoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` },
                  ].map((acc) => (
                    <button
                      key={acc.key}
                      type="button"
                      onClick={() => setWithdrawalAccount(acc.key as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        withdrawalAccount === acc.key
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{acc.label}</span>
                      <span className="text-[10px] font-mono text-neutral-400 mt-0.5 block">Saldo en cuenta: {acc.bal}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Concepto / Nota */}
              <div>
                <label className="text-xs font-mono font-bold uppercase text-neutral-300 block mb-1.5">
                  4. Concepto / Motivo del Retiro:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cierre quincenal de sueldos / Pago personal Andrés"
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Preview de Distribución Si es Ambos */}
              {withdrawalPartner === 'Ambos' && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs font-mono space-y-1">
                  <span className="text-amber-400 font-bold block">Desglose 50% / 50%:</span>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Andrés (50%):</span>
                    <strong className="text-white">${((parseFloat(withdrawalAmountInput) || 0) / 2).toFixed(2)} USD</strong>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Valeria (50%):</span>
                    <strong className="text-white">${((parseFloat(withdrawalAmountInput) || 0) / 2).toFixed(2)} USD</strong>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setWithdrawalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <DollarSign size={14} />
                  <span>Confirmar Retiro y Desembolsar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
