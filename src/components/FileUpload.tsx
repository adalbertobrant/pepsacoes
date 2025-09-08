import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, error }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📊 Analisador PEPS - Carteira de Ações
        </h2>
        <p className="text-gray-600">
          Faça upload do seu arquivo CSV para análise com método PEPS brasileiro
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isLoading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <label htmlFor="csv-file" className="cursor-pointer">
              <span className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
                {isLoading ? 'Processando...' : 'Selecionar Arquivo CSV'}
              </span>
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            Ou arraste e solte o arquivo aqui
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Formato do CSV:</h3>
        <p className="text-sm text-blue-800">
          Colunas necessárias: Entrada/Saída, Data, Produto, Quantidade, Preço unitário, Valor da Operação
        </p>
      </div>
    </div>
  );
};

export default FileUpload;