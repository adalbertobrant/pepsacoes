import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { Transaction } from '../utils/pepsCalculator';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<'all' | 'Credito' | 'Debito'>('all');
  const [filterTicker, setFilterTicker] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const tickerMatch = !filterTicker || 
      transaction.ticker.toLowerCase().includes(filterTicker.toLowerCase());
    return typeMatch && tickerMatch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex, 
    startIndex + itemsPerPage
  );

  const uniqueTickers = Array.from(new Set(transactions.map(t => t.ticker))).sort();

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Histórico de Transações
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as operações</option>
              <option value="Credito">Apenas compras</option>
              <option value="Debito">Apenas vendas</option>
            </select>
            
            <select
              value={filterTicker}
              onChange={(e) => setFilterTicker(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as ações</option>
              {uniqueTickers.map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {paginatedTransactions.length} de {filteredTransactions.length} transações
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Data</th>
              <th className="px-6 py-4 text-left font-semibold">Tipo</th>
              <th className="px-6 py-4 text-left font-semibold">Ação</th>
              <th className="px-6 py-4 text-right font-semibold">Quantidade</th>
              <th className="px-6 py-4 text-right font-semibold">Preço Unitário</th>
              <th className="px-6 py-4 text-right font-semibold">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction, index) => (
              <tr 
                key={`${transaction.date.getTime()}-${transaction.ticker}-${index}`}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition-colors`}
              >
                <td className="px-6 py-4 text-gray-700">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center space-x-2 ${
                    transaction.type === 'Credito' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'Credito' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold">
                      {transaction.type === 'Credito' ? 'Compra' : 'Venda'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {transaction.ticker.substring(0, 2)}
                    </div>
                    <span className="font-semibold text-gray-800">{transaction.ticker}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  {transaction.quantity.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  {formatCurrency(transaction.unitPrice)}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold">
                  {formatCurrency(transaction.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedTransactions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhuma transação encontrada com os filtros aplicados.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;