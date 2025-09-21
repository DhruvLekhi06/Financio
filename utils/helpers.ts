import { Transaction, CashFlow } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const exportToCsv = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) {
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
        cell = cell instanceof Date
          ? cell.toLocaleString()
          : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCsv = (csvText: string): object[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== header.length) continue;

        const row: { [key: string]: any } = {};
        for (let j = 0; j < header.length; j++) {
            let value = values[j].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            // Attempt to convert numbers
            if (!isNaN(Number(value)) && value.trim() !== '') {
                row[header[j]] = Number(value);
            } else {
                row[header[j]] = value;
            }
        }
        rows.push(row);
    }
    return rows;
}


export const calculateCashFlow = (transactions: Transaction[], months = 6): CashFlow[] => {
  const cashFlowMap = new Map<string, { inflow: number; outflow: number }>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize the last 6 months
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${monthNames[d.getMonth()]}`;
    if (!cashFlowMap.has(monthKey)) {
        cashFlowMap.set(monthKey, { inflow: 0, outflow: 0 });
    }
  }

  // Populate with transaction data
  transactions.forEach(t => {
    const transactionDate = new Date(t.date);
    const monthKey = `${monthNames[transactionDate.getMonth()]}`;
    
    if (cashFlowMap.has(monthKey)) {
      const current = cashFlowMap.get(monthKey)!;
      if (t.type === 'inflow') {
        current.inflow += t.amount;
      } else {
        current.outflow += t.amount;
      }
      cashFlowMap.set(monthKey, current);
    }
  });
  
  const result: CashFlow[] = [];
  cashFlowMap.forEach((value, key) => {
    result.push({
      month: key,
      inflow: value.inflow,
      outflow: value.outflow,
      net: value.inflow - value.outflow
    });
  });

  return result;
};