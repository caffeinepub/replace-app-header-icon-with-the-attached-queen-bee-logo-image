import type { WorkOrder, WorkOrderWithCustomerName, CreateWorkOrderInput, UpdateWorkOrderInput, WorkOrderStatus } from '@/backend';

export interface WorkOrderFormData {
  customerId: bigint;
  description: string;
  status: WorkOrderStatus;
  cost: string;
  notes: string;
  
  // Customer & Instrument Info
  customerName?: string;
  brand?: string;
  typeModel?: string;
  bodyColor?: string;
  serialNumber?: string;
  estMfgDate?: string;
  neck?: string;
  weight?: string;
  bridge?: string;
  tuners?: string;
  dateReceived?: string;
  datePickedUp?: string;
  
  // Problems and Issues
  problemsAndIssues?: string;
  
  // Setup Data
  neckReliefBefore?: string;
  neckReliefAfter?: string;
  fretboardRadius?: string;
  fretType?: string;
  fretCondition?: string;
  levelAndCrownSuggested?: string;
  levelAndCrownPerformed?: string;
  
  // Tuning measurements (8 strings, Before/After)
  tuning?: {
    [key: string]: { before: string; after: string };
  };
  
  // Electronics
  volumePotBefore?: string;
  volumePotAfter?: string;
  trebleBPCapBefore?: string;
  trebleBPCapAfter?: string;
  tonePotBefore?: string;
  tonePotAfter?: string;
  toneCapBefore?: string;
  toneCapAfter?: string;
  bridgeGroundBefore?: string;
  bridgeGroundAfter?: string;
  bridgePickupBefore?: string;
  bridgePickupAfter?: string;
  middlePickupBefore?: string;
  middlePickupAfter?: string;
  neckPickupBefore?: string;
  neckPickupAfter?: string;
}

export function workOrderToFormData(workOrder: WorkOrder): WorkOrderFormData {
  // Parse notes field to extract structured data
  const parsedData = parseNotesField(workOrder.notes || '');
  
  return {
    customerId: workOrder.customerId,
    description: workOrder.description,
    status: workOrder.status,
    cost: (Number(workOrder.cost) / 100).toFixed(2),
    notes: workOrder.notes || '',
    ...parsedData,
  };
}

export function formDataToCreateInput(data: WorkOrderFormData): CreateWorkOrderInput {
  const costInCents = Math.round(parseFloat(data.cost || '0') * 100);
  
  return {
    customerId: data.customerId,
    description: data.description,
    status: data.status,
    cost: BigInt(costInCents),
    notes: serializeFormDataToNotes(data),
    services: [],
    images: undefined,
  };
}

export function formDataToUpdateInput(data: WorkOrderFormData): UpdateWorkOrderInput {
  const costInCents = Math.round(parseFloat(data.cost || '0') * 100);
  
  return {
    customerId: data.customerId,
    description: data.description,
    status: data.status,
    cost: BigInt(costInCents),
    notes: serializeFormDataToNotes(data),
    services: [],
    images: undefined,
  };
}

function serializeFormDataToNotes(data: WorkOrderFormData): string {
  const sections: string[] = [];
  
  // Customer & Instrument Info
  if (data.brand || data.typeModel || data.bodyColor || data.serialNumber) {
    sections.push(`[INSTRUMENT]
Brand: ${data.brand || ''}
Type/Model: ${data.typeModel || ''}
Body Color: ${data.bodyColor || ''}
Serial #: ${data.serialNumber || ''}
Est Mfg Date: ${data.estMfgDate || ''}
Neck: ${data.neck || ''}
Weight: ${data.weight || ''}
Bridge: ${data.bridge || ''}
Tuners: ${data.tuners || ''}
Date Received: ${data.dateReceived || ''}
Date Picked Up: ${data.datePickedUp || ''}`);
  }
  
  // Problems and Issues
  if (data.problemsAndIssues) {
    sections.push(`[PROBLEMS]
${data.problemsAndIssues}`);
  }
  
  // Setup Data
  if (data.neckReliefBefore || data.neckReliefAfter || data.fretboardRadius) {
    sections.push(`[SETUP]
Neck Relief Before: ${data.neckReliefBefore || ''}
Neck Relief After: ${data.neckReliefAfter || ''}
Fretboard Radius: ${data.fretboardRadius || ''}
Fret Type: ${data.fretType || ''}
Fret Condition: ${data.fretCondition || ''}
Level & Crown Suggested: ${data.levelAndCrownSuggested || ''}
Level & Crown Performed: ${data.levelAndCrownPerformed || ''}`);
  }
  
  // Tuning
  if (data.tuning) {
    const tuningLines = Object.entries(data.tuning)
      .map(([key, value]) => `${key}: B=${value.before || ''} A=${value.after || ''}`)
      .join('\n');
    sections.push(`[TUNING]\n${tuningLines}`);
  }
  
  // Electronics
  if (data.volumePotBefore || data.volumePotAfter) {
    sections.push(`[ELECTRONICS]
Volume Pot: B=${data.volumePotBefore || ''} A=${data.volumePotAfter || ''}
Treble BP Cap: B=${data.trebleBPCapBefore || ''} A=${data.trebleBPCapAfter || ''}
Tone Pot: B=${data.tonePotBefore || ''} A=${data.tonePotAfter || ''}
Tone Cap: B=${data.toneCapBefore || ''} A=${data.toneCapAfter || ''}
Bridge Ground: B=${data.bridgeGroundBefore || ''} A=${data.bridgeGroundAfter || ''}
Bridge Pickup: B=${data.bridgePickupBefore || ''} A=${data.bridgePickupAfter || ''}
Middle Pickup: B=${data.middlePickupBefore || ''} A=${data.middlePickupAfter || ''}
Neck Pickup: B=${data.neckPickupBefore || ''} A=${data.neckPickupAfter || ''}`);
  }
  
  return sections.join('\n\n');
}

function parseNotesField(notes: string): Partial<WorkOrderFormData> {
  const result: Partial<WorkOrderFormData> = {};
  
  // Parse sections
  const instrumentMatch = notes.match(/\[INSTRUMENT\]([\s\S]*?)(?=\[|$)/);
  if (instrumentMatch) {
    const section = instrumentMatch[1];
    result.brand = extractField(section, 'Brand');
    result.typeModel = extractField(section, 'Type/Model');
    result.bodyColor = extractField(section, 'Body Color');
    result.serialNumber = extractField(section, 'Serial #');
    result.estMfgDate = extractField(section, 'Est Mfg Date');
    result.neck = extractField(section, 'Neck');
    result.weight = extractField(section, 'Weight');
    result.bridge = extractField(section, 'Bridge');
    result.tuners = extractField(section, 'Tuners');
    result.dateReceived = extractField(section, 'Date Received');
    result.datePickedUp = extractField(section, 'Date Picked Up');
  }
  
  const problemsMatch = notes.match(/\[PROBLEMS\]([\s\S]*?)(?=\[|$)/);
  if (problemsMatch) {
    result.problemsAndIssues = problemsMatch[1].trim();
  }
  
  const setupMatch = notes.match(/\[SETUP\]([\s\S]*?)(?=\[|$)/);
  if (setupMatch) {
    const section = setupMatch[1];
    result.neckReliefBefore = extractField(section, 'Neck Relief Before');
    result.neckReliefAfter = extractField(section, 'Neck Relief After');
    result.fretboardRadius = extractField(section, 'Fretboard Radius');
    result.fretType = extractField(section, 'Fret Type');
    result.fretCondition = extractField(section, 'Fret Condition');
    result.levelAndCrownSuggested = extractField(section, 'Level & Crown Suggested');
    result.levelAndCrownPerformed = extractField(section, 'Level & Crown Performed');
  }
  
  const tuningMatch = notes.match(/\[TUNING\]([\s\S]*?)(?=\[|$)/);
  if (tuningMatch) {
    const section = tuningMatch[1];
    result.tuning = {};
    const lines = section.trim().split('\n');
    lines.forEach(line => {
      const match = line.match(/(.+?):\s*B=(.+?)\s*A=(.+?)$/);
      if (match) {
        const [, key, before, after] = match;
        result.tuning![key.trim()] = { before: before.trim(), after: after.trim() };
      }
    });
  }
  
  const electronicsMatch = notes.match(/\[ELECTRONICS\]([\s\S]*?)(?=\[|$)/);
  if (electronicsMatch) {
    const section = electronicsMatch[1];
    const parseBeforeAfter = (line: string) => {
      const match = line.match(/B=(.+?)\s*A=(.+?)$/);
      return match ? { before: match[1].trim(), after: match[2].trim() } : { before: '', after: '' };
    };
    
    const volumePot = parseBeforeAfter(extractField(section, 'Volume Pot') || '');
    result.volumePotBefore = volumePot.before;
    result.volumePotAfter = volumePot.after;
    
    const trebleBPCap = parseBeforeAfter(extractField(section, 'Treble BP Cap') || '');
    result.trebleBPCapBefore = trebleBPCap.before;
    result.trebleBPCapAfter = trebleBPCap.after;
    
    const tonePot = parseBeforeAfter(extractField(section, 'Tone Pot') || '');
    result.tonePotBefore = tonePot.before;
    result.tonePotAfter = tonePot.after;
    
    const toneCap = parseBeforeAfter(extractField(section, 'Tone Cap') || '');
    result.toneCapBefore = toneCap.before;
    result.toneCapAfter = toneCap.after;
    
    const bridgeGround = parseBeforeAfter(extractField(section, 'Bridge Ground') || '');
    result.bridgeGroundBefore = bridgeGround.before;
    result.bridgeGroundAfter = bridgeGround.after;
    
    const bridgePickup = parseBeforeAfter(extractField(section, 'Bridge Pickup') || '');
    result.bridgePickupBefore = bridgePickup.before;
    result.bridgePickupAfter = bridgePickup.after;
    
    const middlePickup = parseBeforeAfter(extractField(section, 'Middle Pickup') || '');
    result.middlePickupBefore = middlePickup.before;
    result.middlePickupAfter = middlePickup.after;
    
    const neckPickup = parseBeforeAfter(extractField(section, 'Neck Pickup') || '');
    result.neckPickupBefore = neckPickup.before;
    result.neckPickupAfter = neckPickup.after;
  }
  
  return result;
}

function extractField(section: string, fieldName: string): string {
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n|$)`, 'i');
  const match = section.match(regex);
  return match ? match[1].trim() : '';
}

export function formatWorkOrderStatus(status: WorkOrderStatus): string {
  switch (status) {
    case 'pending_payment':
      return 'Pending Payment';
    case 'finalized':
      return 'Finalized';
    case 'sent_for_approval':
      return 'Sent for Approval';
    case 'in_progress':
      return 'In Progress';
    case 'cancelled':
      return 'Cancelled';
    case 'approved':
      return 'Approved';
    case 'complete':
      return 'Complete';
    default:
      return status;
  }
}

export function getStatusBadgeVariant(status: WorkOrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'complete':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}
