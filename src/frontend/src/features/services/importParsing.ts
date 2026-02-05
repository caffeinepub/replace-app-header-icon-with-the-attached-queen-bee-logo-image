import { parseCurrency } from './types';

export interface ParsedServiceRow {
  rowIndex: number;
  name: string;
  serviceType: string;
  priceString: string;
  priceCents: bigint;
  service: string;
  notes: string;
  isValid: boolean;
  errorMessage?: string;
}

export function parseImportData(text: string): ParsedServiceRow[] {
  const lines = text.trim().split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }

  // Detect delimiter (CSV or TSV)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const rows: ParsedServiceRow[] = [];

  lines.forEach((line, index) => {
    const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
    
    // Skip header row if it looks like a header
    if (index === 0 && (
      parts[0]?.toLowerCase() === 'name' || 
      parts[0]?.toLowerCase() === 'service' ||
      parts[0]?.toLowerCase() === 'service name'
    )) {
      return;
    }

    const name = parts[0] || '';
    const serviceType = parts[1] || '';
    const priceString = parts[2] || '';
    const service = parts[3] || '';
    const notes = parts[4] || '';

    let isValid = true;
    let errorMessage: string | undefined;
    let priceCents = BigInt(0);

    // Validate name
    if (!name || name.trim().length === 0) {
      isValid = false;
      errorMessage = 'Service name is required';
    }

    // Validate and parse price
    if (isValid) {
      try {
        priceCents = parseCurrency(priceString);
        if (priceCents <= BigInt(0)) {
          isValid = false;
          errorMessage = 'Price must be greater than zero';
        }
      } catch (error) {
        isValid = false;
        errorMessage = 'Invalid price format';
      }
    }

    rows.push({
      rowIndex: index,
      name,
      serviceType,
      priceString,
      priceCents,
      service,
      notes,
      isValid,
      errorMessage,
    });
  });

  return rows;
}
