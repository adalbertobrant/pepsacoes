import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface StockPosition {
  ticker: string;
  quantity: number;
  averagePrice: number;
  totalValue: number;
  currentPrice?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  error?: string;
}

interface StockTableProps {
  positions: StockPosition[];
  title: string;
}

const StockTable: React.FC<StockTableProps> = ({ positions, title }) => {
  const [sortField, setSortField] = useState<keyof StockPosition>('totalValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const handleSort = (field: keyof StockPosition) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedPositions = positions
    .filter(position => 
      position.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] as number;
      const bValue = b[sortField] as number;
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const SortIcon = ({ field }: { field: keyof StockPosition }) => {
    if (sortField !== field) return <div className="w-4 h-4 opacity-0" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              {[
                { label: 'Ação', field: 'ticker', align: 'left' },
                { label: 'Quantidade', field: 'quantity', align: 'right' },
                { label: 'Preço Médio', field: 'averagePrice', align: 'right' },
                { label: 'Preço Atual', field: 'currentPrice', align: 'right' },
                { label: 'Valor Total', field: 'totalValue', align: 'right' },
                { label: 'L/P', field: 'profitLoss', align: 'right' },
                { label: 'L/P %', field: 'profitLossPercent', align: 'right' },
              ].map(({ label, field, align }) => (
                <th 
                  key={field}
                  className={`px-6 py-4 text-${align} font-semibold cursor-pointer hover:bg-blue-700 transition-colors`}
                  onClick={() => handleSort(field as keyof StockPosition)}
                >
                  <div className={`flex items-center space-x-1 ${align === 'right' ? 'justify-end' : ''}`}>
                    <span>{label}</span>
                    <SortIcon field={field as keyof StockPosition} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPositions.map((position, index) => (
              <tr 
                key={position.ticker}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition-colors`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {position.ticker.substring(0, 2)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{position.ticker}</span>
                      {position.error && (
                        <div className="flex items-center text-xs text-red-500" title={position.error}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>Erro</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  {position.quantity.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  {formatCurrency(position.averagePrice)}
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  {formatCurrency(position.currentPrice)}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold">
                  {formatCurrency(position.totalValue)}
                </td>
                <td className={`px-6 py-4 text-right font-mono font-semibold ${
                  (position.profitLoss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(position.profitLoss)}
                </td>
                <td className={`px-6 py-4 text-right font-mono font-semibold ${
                  (position.profitLossPercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="flex items-center justify-end space-x-2">
                    <span>{formatPercent(position.profitLossPercent)}</span>
                    {(position.profitLossPercent ?? 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedPositions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhuma posição encontrada.</p>
        </div>
      )}
    </div>
  );
};

export default StockTable;
