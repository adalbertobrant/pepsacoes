import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Archive } from 'lucide-react';

interface PortfolioSummaryProps {
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  totalStocks: number;
  totalGainLoss?: number;
  totalGainLossPercent?: number;
  totalAcquisitionCost: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalQuantity,
  totalValue,
  averagePrice,
  totalStocks,
  totalGainLoss = 0,
  totalGainLossPercent = 0,
  totalAcquisitionCost,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format(value / 100);
  };

  const isGain = totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{totalQuantity.toLocaleString('pt-BR')}</span>
        </div>
        <h3 className="text-gray-600 font-medium">Total de Ações</h3>
        <p className="text-sm text-gray-500">{totalStocks} ativos diferentes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Archive className="h-6 w-6 text-orange-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{formatCurrency(totalAcquisitionCost)}</span>
        </div>
        <h3 className="text-gray-600 font-medium">Valor de Aquisição</h3>
        <p className="text-sm text-gray-500">Custo total de compra</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{formatCurrency(totalValue)}</span>
        </div>
        <h3 className="text-gray-600 font-medium">Valor Total</h3>
        <p className="text-sm text-gray-500">Posição atual</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full ${isGain ? 'bg-green-100' : 'bg-red-100'}`}>
            {isGain ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
          <span className={`text-2xl font-bold ${isGain ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(totalGainLoss))}
          </span>
        </div>
        <h3 className="text-gray-600 font-medium">
          {isGain ? 'Ganho Total' : 'Perda Total'}
        </h3>
        <p className={`text-sm ${isGain ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercent(totalGainLossPercent)}
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{formatCurrency(averagePrice)}</span>
        </div>
        <h3 className="text-gray-600 font-medium">Preço Médio PEPS</h3>
        <p className="text-sm text-gray-500">Por ação na carteira</p>
      </div>

    </div>
  );
};

export default PortfolioSummary;
