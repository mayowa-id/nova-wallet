import React, { useState, useEffect } from 'react';
import { Wallet, Send, Plus, Moon, Sun, DollarSign, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, Activity, Zap, Copy, Check } from 'lucide-react';

const API_URL = 'https://nova-wallet-six.vercel.app';

export default function WalletDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState(null);
  
  // Form states
  const [fundAmount, setFundAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showMessage('success', '✓ Wallet address copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      showMessage('error', '✗ Failed to copy address');
    }
  };

  const createWallet = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: 'USD' }),
      });
      const data = await response.json();
      setWallets([...wallets, data]);
      if (!selectedWallet) {
        setSelectedWallet(data);
        loadWalletDetails(data.id);
      }
      showMessage('success', '✓ Wallet created successfully!');
    } catch (error) {
      showMessage('error', '✗ Failed to create wallet');
    }
    setLoading(false);
  };

  const fundWallet = async () => {
    if (!selectedWallet || !fundAmount) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/wallets/${selectedWallet.id}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(fundAmount),
          idempotencyKey: `fund-${Date.now()}`,
        }),
      });
      const data = await response.json();
      setSelectedWallet(data.wallet);
      setWallets(wallets.map(w => w.id === data.wallet.id ? data.wallet : w));
      setFundAmount('');
      showMessage('success', `✓ Added $${fundAmount} to your wallet`);
      loadWalletDetails(selectedWallet.id);
    } catch (error) {
      showMessage('error', '✗ Failed to fund wallet');
    }
    setLoading(false);
  };

  const transferFunds = async () => {
    if (!selectedWallet || !transferAmount || !destinationWalletId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/wallets/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceWalletId: selectedWallet.id,
          destinationWalletId,
          amount: parseFloat(transferAmount),
          idempotencyKey: `transfer-${Date.now()}`,
        }),
      });
      const data = await response.json();
      setSelectedWallet(data.sourceWallet);
      setWallets(wallets.map(w => 
        w.id === data.sourceWallet.id ? data.sourceWallet :
        w.id === data.destinationWallet.id ? data.destinationWallet : w
      ));
      setTransferAmount('');
      setDestinationWalletId('');
      showMessage('success', `✓ Transferred $${transferAmount} successfully`);
      loadWalletDetails(selectedWallet.id);
    } catch (error) {
      showMessage('error', error.message || '✗ Failed to transfer funds');
    }
    setLoading(false);
  };

  const loadWalletDetails = async (walletId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/wallets/${walletId}`);
      const data = await response.json();
      setSelectedWallet(data.wallet);
      setTransactions(data.transactions || []);
    } catch (error) {
      showMessage('error', '✗ Failed to load wallet details');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type) => {
    if (type === 'FUND') return <TrendingUp className="w-5 h-5" />;
    if (type === 'TRANSFER_OUT') return <ArrowUpRight className="w-5 h-5" />;
    return <ArrowDownLeft className="w-5 h-5" />;
  };

  const getTotalBalance = () => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-xl border-b transition-colors ${
        darkMode 
          ? 'bg-gray-900/50 border-gray-700/50' 
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                 nova pro
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Digital wallet platform
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-xl backdrop-blur-xl border ${
            message.type === 'success' 
              ? darkMode
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-green-50 border-green-200 text-green-800'
              : darkMode
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-red-50 border-red-200 text-red-800'
          } font-medium`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {wallets.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-2xl p-6 backdrop-blur-xl border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Balance</p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${getTotalBalance().toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 backdrop-blur-xl border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Wallets</p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {wallets.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 backdrop-blur-xl border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transactions</p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transactions.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          {['overview', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'transactions' && !selectedWallet}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? darkMode
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : darkMode
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                    : 'bg-white/50 text-gray-600 hover:bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallets Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Your Wallets
                </h2>
                <button
                  onClick={createWallet}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>

              {wallets.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-50"></div>
                    <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                      <Wallet className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No wallets yet
                  </p>
                  <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create your first wallet to get started
                  </p>
                  <button
                    onClick={createWallet}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg"
                  >
                    Create Wallet
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      onClick={() => {
                        setSelectedWallet(wallet);
                        loadWalletDetails(wallet.id);
                      }}
                      className={`rounded-2xl p-5 cursor-pointer transition-all backdrop-blur-xl border ${
                        selectedWallet?.id === wallet.id
                          ? darkMode
                            ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                            : 'bg-blue-50 border-blue-300 shadow-lg'
                          : darkMode
                            ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70'
                            : 'bg-white/80 border-gray-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {wallet.currency}
                        </span>
                        <DollarSign className={`w-5 h-5 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <p className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${wallet.balance.toFixed(2)}
                      </p>
                      <div 
                        className="group flex items-center space-x-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(wallet.id, wallet.id);
                        }}
                      >
                        <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:text-blue-500 transition-colors`}>
                          {wallet.id.slice(0, 8)}...{wallet.id.slice(-6)}
                        </p>
                        {copiedId === wallet.id ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Column */}
            {selectedWallet ? (
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions Header */}
                <div className="flex items-center space-x-3">
                  <Zap className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Quick Actions
                  </h3>
                </div>

                {/* Fund Wallet Card */}
                <div className={`rounded-2xl p-6 backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' 
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Add Funds
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Deposit money to your wallet
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl font-medium text-lg focus:ring-2 focus:ring-green-500 outline-none transition-all ${
                          darkMode 
                            ? 'bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                    <button
                      onClick={fundWallet}
                      disabled={loading || !fundAmount}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                    >
                      {loading ? 'Processing...' : 'Add Funds'}
                    </button>
                  </div>
                </div>

                {/* Transfer Card */}
                <div className={`rounded-2xl p-6 backdrop-blur-xl border ${
                  darkMode 
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Transfer Funds
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Send money to another wallet
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <select
                      value={destinationWalletId}
                      onChange={(e) => setDestinationWalletId(e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        darkMode 
                          ? 'bg-gray-900/50 border border-gray-700 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="">Select destination wallet</option>
                      {wallets.filter(w => w.id !== selectedWallet.id).map(w => (
                        <option key={w.id} value={w.id}>
                          {w.currency} - ${w.balance.toFixed(2)} ({w.id.slice(0, 8)}...)
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl font-medium text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                          darkMode 
                            ? 'bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                    <button
                      onClick={transferFunds}
                      disabled={loading || !transferAmount || !destinationWalletId}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                    >
                      {loading ? 'Processing...' : 'Transfer Now'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`lg:col-span-2 rounded-2xl p-12 text-center backdrop-blur-xl border ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <Wallet className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select a wallet to perform actions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && selectedWallet && (
          <div className={`rounded-2xl backdrop-blur-xl border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Transaction History
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                All activity for {selectedWallet.id.slice(0, 8)}...{selectedWallet.id.slice(-6)}
              </p>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {transactions.length === 0 ? (
                <div className="p-16 text-center">
                  <Clock className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No transactions yet
                  </p>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className={`p-5 transition-colors ${
                    darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          tx.type === 'FUND' 
                            ? 'bg-green-500/20 text-green-400' 
                            : tx.type === 'TRANSFER_OUT' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {tx.type === 'FUND' ? 'Funds Added' :
                             tx.type === 'TRANSFER_OUT' ? 'Transfer Sent' :
                             'Transfer Received'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          tx.type === 'TRANSFER_OUT' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {tx.type === 'TRANSFER_OUT' ? '-' : '+'}${tx.amount.toFixed(2)}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Balance: ${tx.balanceAfter.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}