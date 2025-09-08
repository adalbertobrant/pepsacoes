import React, { useState } from 'react';
import FileUpload from './FileUpload';
import PortfolioSummary from './PortfolioSummary';
import StockTable from './StockTable';
import TransactionHistory from './TransactionHistory';
import { PepsCalculator, Transaction } from '../utils/pepsCalculator';
import { render } from 'react-dom';

const AppLayout: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError('');
    
    try {
      const text = await file.text();
      const parsedTransactions = PepsCalculator.parseCSVData(text);
      
      if (parsedTransactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo');
      }

      const calculator = new PepsCalculator();
      
      // Processar todas as transações
      for (const transaction of parsedTransactions) {
        calculator.processTransaction(transaction);
      }

      const pepsResult = calculator.calculatePositions();

      // Etapa 2: Enviar o resultado para o backend para obter os preços atuais
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // para usar o render(website render.com)
      const response = await fetch(`${apiUrl}/fetch-current-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positions: pepsResult.positions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao buscar cotações no backend');
      }

      const updatedPositions = await response.json();

      // Etapa 3: Calcular totais e atualizar o estado
      const totalCurrentValue = updatedPositions.reduce((acc: number, pos: any) => {
        if (pos.currentPrice && pos.quantity) {
          return acc + (pos.currentPrice * pos.quantity);
        }
        return acc;
      }, 0);

      const totalGainLoss = totalCurrentValue - pepsResult.totalValue;
      const totalGainLossPercent = pepsResult.totalValue !== 0 ? (totalGainLoss / pepsResult.totalValue) * 100 : 0;

      const finalPortfolioData = {
        ...pepsResult,
        positions: updatedPositions,
        totalGainLoss,
        totalGainLossPercent,
        totalCurrentValue, // Adicionado para possível uso futuro
      };

      setTransactions(parsedTransactions);
      setPortfolioData(finalPortfolioData);
      setActiveTab('summary');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const heroImageUrl = "https://d64gsuwffb70l.cloudfront.net/68bb4dd41a6e837c0f88d3bd_1757105669668_91f63021.webp";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🇧🇷 Calculadora PEPS
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Análise profissional de carteira de ações usando o método PEPS brasileiro
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2 text-green-400">
                <span className="text-2xl">✅</span>
                <span>Método PEPS Oficial</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="text-2xl">📊</span>
                <span>Análise Completa</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <span className="text-2xl">🚀</span>
                <span>Interface Moderna</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <FileUpload 
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          error={error}
        />

        {portfolioData && (
          <>
            <PortfolioSummary
              totalQuantity={portfolioData.totalQuantity}
              totalValue={portfolioData.totalCurrentValue} // Usar o valor atualizado
              averagePrice={portfolioData.averagePrice}
              totalStocks={portfolioData.totalStocks}
              totalGainLoss={portfolioData.totalGainLoss}
              totalGainLossPercent={portfolioData.totalGainLossPercent}
              totalAcquisitionCost={portfolioData.totalValue}
            />

            {/* Tabs */}
            <div className="flex space-x-1 mb-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                📈 Posições Atuais
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                📋 Histórico de Transações
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'summary' && (
              <div className="space-y-8">
                <StockTable
                  positions={portfolioData.positions}
                  title="🏦 Posições Atuais (Apenas com Saldo)"
                />
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">📋 Metodologia PEPS:</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">1️⃣</div>
                      <h4 className="font-semibold mb-2">Ordenação Cronológica</h4>
                      <p className="text-sm opacity-90">
                        Todas as operações são ordenadas por data
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">2️⃣</div>
                      <h4 className="font-semibold mb-2">Processamento PEPS</h4>
                      <p className="text-sm opacity-90">
                        Primeiro que entra, primeiro que sai
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">3️⃣</div>
                      <h4 className="font-semibold mb-2">Filtro de Posições</h4>
                      <p className="text-sm opacity-90">
                          Apenas ações com saldo &gt; 0 aparecem
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <TransactionHistory transactions={transactions} />
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-white/70">
          <p className="text-sm">
            💡 Desenvolvido para análise de carteiras de ações brasileiras usando metodologia PEPS oficial
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;