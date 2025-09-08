export interface Transaction {
  type: 'Credito' | 'Debito';
  date: Date;
  ticker: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

export interface StockLot {
  date: Date;
  quantity: number;
  unitPrice: number;
}

export interface StockPosition {
  ticker: string;
  quantity: number;
  averagePrice: number;
  totalValue: number;
  lots: StockLot[];
}

export interface PepsResult {
  positions: StockPosition[];
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  totalStocks: number;
}

export class PepsCalculator {
  private stocksByTicker: Map<string, StockLot[]> = new Map();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.stocksByTicker.clear();
  }

  processTransaction(transaction: Transaction): void {
    const { ticker, type, quantity, unitPrice, date } = transaction;

    if (!this.stocksByTicker.has(ticker)) {
      this.stocksByTicker.set(ticker, []);
    }

    const lots = this.stocksByTicker.get(ticker)!;

    if (type === 'Credito') {
      // Compra: adicionar novo lote
      lots.push({
        date,
        quantity,
        unitPrice
      });
    } else if (type === 'Debito') {
      // Venda: usar PEPS (primeiro que entra, primeiro que sai)
      let remainingToSell = quantity;

      while (remainingToSell > 0 && lots.length > 0) {
        const firstLot = lots[0];

        if (firstLot.quantity <= remainingToSell) {
          // Vender todo o lote
          remainingToSell -= firstLot.quantity;
          lots.shift(); // Remove o primeiro lote
        } else {
          // Vender parte do lote
          firstLot.quantity -= remainingToSell;
          remainingToSell = 0;
        }
      }

      // Se ainda há quantidade para vender mas não há estoque, 
      // isso indica um erro nos dados ou venda a descoberto
      if (remainingToSell > 0) {
        console.warn(`Tentativa de venda de ${remainingToSell} ações de ${ticker} sem estoque suficiente`);
      }
    }
  }

  calculatePositions(): PepsResult {
    const positions: StockPosition[] = [];
    let totalQuantity = 0;
    let totalValue = 0;

    for (const [ticker, lots] of this.stocksByTicker.entries()) {
      let tickerQuantity = 0;
      let tickerValue = 0;

      // Calcular quantidade e valor total para este ticker
      for (const lot of lots) {
        tickerQuantity += lot.quantity;
        tickerValue += lot.quantity * lot.unitPrice;
      }

      // Apenas incluir posições com quantidade > 0
      if (tickerQuantity > 0) {
        const averagePrice = tickerValue / tickerQuantity;

        positions.push({
          ticker,
          quantity: tickerQuantity,
          averagePrice,
          totalValue: tickerValue,
          lots: [...lots] // Cópia dos lotes
        });

        totalQuantity += tickerQuantity;
        totalValue += tickerValue;
      }
    }

    // Ordenar por valor total (maior primeiro)
    positions.sort((a, b) => b.totalValue - a.totalValue);

    const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    return {
      positions,
      totalQuantity,
      totalValue,
      averagePrice,
      totalStocks: positions.length
    };
  }

  static parseCSVData(csvData: string): Transaction[] {
    const lines = csvData.split('\n');
    if (lines.length < 2) {
      throw new Error('Arquivo CSV inválido: deve conter pelo menos um cabeçalho e uma linha de dados');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Encontrar índices das colunas necessárias
    const columnMap = {
      type: this.findColumnIndex(headers, ['Entrada/Saída', 'Tipo', 'Operação']),
      date: this.findColumnIndex(headers, ['Data']),
      product: this.findColumnIndex(headers, ['Produto', 'Ativo', 'Papel']),
      quantity: this.findColumnIndex(headers, ['Quantidade', 'Qtd']),
      unitPrice: this.findColumnIndex(headers, ['Preço unitário', 'Preço', 'Preço Unitário']),
      totalValue: this.findColumnIndex(headers, ['Valor da Operação', 'Valor Total', 'Total'])
    };

    // Verificar se todas as colunas necessárias foram encontradas
    const missingColumns = Object.entries(columnMap)
      .filter(([_, index]) => index === -1)
      .map(([key]) => key);

    if (missingColumns.length > 0) {
      throw new Error(`Colunas não encontradas: ${missingColumns.join(', ')}`);
    }

    const transactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = this.parseCSVLine(line);
        
        if (values.length < Math.max(...Object.values(columnMap)) + 1) {
          console.warn(`Linha ${i + 1} ignorada: dados insuficientes`);
          continue;
        }

        const type = values[columnMap.type].trim().replace(/"/g, '');
        const dateStr = values[columnMap.date].trim().replace(/"/g, '');
        const product = values[columnMap.product].trim().replace(/"/g, '');
        const quantityStr = values[columnMap.quantity].trim().replace(/"/g, '');
        const unitPriceStr = values[columnMap.unitPrice].trim().replace(/"/g, '');
        const totalValueStr = values[columnMap.totalValue].trim().replace(/"/g, '');

        // Extrair ticker do produto (primeira parte antes do hífen ou espaço)
        const ticker = product.split(/[-\s]/)[0].trim().toUpperCase();
        
        // Converter valores
        const quantity = parseInt(quantityStr.replace(/\./g, ''));
        const unitPrice = this.parseMonetaryValue(unitPriceStr);
        const totalValue = this.parseMonetaryValue(totalValueStr);
        const date = this.parseDate(dateStr);

        if (isNaN(quantity) || isNaN(unitPrice) || isNaN(totalValue)) {
          console.warn(`Linha ${i + 1} ignorada: valores numéricos inválidos`);
          continue;
        }

        transactions.push({
          type: type as 'Credito' | 'Debito',
          date,
          ticker,
          quantity,
          unitPrice,
          totalValue
        });

      } catch (error) {
        console.warn(`Erro ao processar linha ${i + 1}:`, error);
      }
    }

    // Ordenar transações por data
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    return transactions;
  }

  private static findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => 
        h.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  private static parseDate(dateStr: string): Date {
    // Suporta formatos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const cleanDate = dateStr.replace(/['"]/g, '').trim();
    
    if (cleanDate.includes('/')) {
      const [day, month, year] = cleanDate.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (cleanDate.includes('-')) {
      const parts = cleanDate.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(cleanDate);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    throw new Error(`Formato de data inválido: ${dateStr}`);
  }

  private static parseMonetaryValue(valueStr: string): number {
    // Remove R$, espaços, pontos (milhares) e substitui vírgula por ponto
    const cleaned = valueStr
      .replace(/R\$?\s*/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    return parseFloat(cleaned);
  }
}