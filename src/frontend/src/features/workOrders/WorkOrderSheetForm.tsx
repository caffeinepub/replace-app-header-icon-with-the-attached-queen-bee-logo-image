import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { WorkOrderFormData } from './types';

interface WorkOrderSheetFormProps {
  formData: WorkOrderFormData;
  onChange: (data: WorkOrderFormData) => void;
  customerName?: string;
}

export default function WorkOrderSheetForm({ formData, onChange, customerName }: WorkOrderSheetFormProps) {
  const updateField = (field: keyof WorkOrderFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const updateTuning = (stringNum: string, type: 'before' | 'after', value: string) => {
    const tuning = formData.tuning || {};
    const current = tuning[stringNum] || { before: '', after: '' };
    onChange({
      ...formData,
      tuning: {
        ...tuning,
        [stringNum]: { ...current, [type]: value },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer & Instrument Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer & Instrument Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border rounded-lg p-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input id="customer" value={customerName || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial #</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber || ''}
                onChange={(e) => updateField('serialNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand || ''}
                onChange={(e) => updateField('brand', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estMfgDate">Est Mfg Date</Label>
              <Input
                id="estMfgDate"
                value={formData.estMfgDate || ''}
                onChange={(e) => updateField('estMfgDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeModel">Type/Model</Label>
              <Input
                id="typeModel"
                value={formData.typeModel || ''}
                onChange={(e) => updateField('typeModel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neck">Neck</Label>
              <Input
                id="neck"
                value={formData.neck || ''}
                onChange={(e) => updateField('neck', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyColor">Body Color</Label>
              <Input
                id="bodyColor"
                value={formData.bodyColor || ''}
                onChange={(e) => updateField('bodyColor', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={formData.weight || ''}
                onChange={(e) => updateField('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bridge">Bridge</Label>
              <Input
                id="bridge"
                value={formData.bridge || ''}
                onChange={(e) => updateField('bridge', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuners">Tuners</Label>
              <Input
                id="tuners"
                value={formData.tuners || ''}
                onChange={(e) => updateField('tuners', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateReceived">Date Received</Label>
              <Input
                id="dateReceived"
                type="date"
                value={formData.dateReceived || ''}
                onChange={(e) => updateField('dateReceived', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datePickedUp">Date Picked Up</Label>
              <Input
                id="datePickedUp"
                type="date"
                value={formData.datePickedUp || ''}
                onChange={(e) => updateField('datePickedUp', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems and Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Problems and Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.problemsAndIssues || ''}
            onChange={(e) => updateField('problemsAndIssues', e.target.value)}
            placeholder="Describe the problems and issues..."
            rows={4}
            className="border-border"
          />
        </CardContent>
      </Card>

      {/* Setup Data */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Neck Relief (Before)</Label>
                <Input
                  value={formData.neckReliefBefore || ''}
                  onChange={(e) => updateField('neckReliefBefore', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Neck Relief (After)</Label>
                <Input
                  value={formData.neckReliefAfter || ''}
                  onChange={(e) => updateField('neckReliefAfter', e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fretboard Radius (ref)</Label>
                <Input
                  value={formData.fretboardRadius || ''}
                  onChange={(e) => updateField('fretboardRadius', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fret Type</Label>
                <Input
                  value={formData.fretType || ''}
                  onChange={(e) => updateField('fretType', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fret Condition</Label>
                <Input
                  value={formData.fretCondition || ''}
                  onChange={(e) => updateField('fretCondition', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level & Crown Suggested</Label>
                <Input
                  value={formData.levelAndCrownSuggested || ''}
                  onChange={(e) => updateField('levelAndCrownSuggested', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Level & Crown Performed</Label>
                <Input
                  value={formData.levelAndCrownPerformed || ''}
                  onChange={(e) => updateField('levelAndCrownPerformed', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tuning Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>Tuning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border p-2 text-left font-medium">String</th>
                  <th className="border border-border p-2 text-center font-medium">Before</th>
                  <th className="border border-border p-2 text-center font-medium">After</th>
                </tr>
              </thead>
              <tbody>
                {['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8'].map((stringNum) => (
                  <tr key={stringNum}>
                    <td className="border border-border p-2 font-medium">{stringNum}</td>
                    <td className="border border-border p-1">
                      <Input
                        value={formData.tuning?.[stringNum]?.before || ''}
                        onChange={(e) => updateTuning(stringNum, 'before', e.target.value)}
                        className="border-0 text-center"
                      />
                    </td>
                    <td className="border border-border p-1">
                      <Input
                        value={formData.tuning?.[stringNum]?.after || ''}
                        onChange={(e) => updateTuning(stringNum, 'after', e.target.value)}
                        className="border-0 text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Electronics */}
      <Card>
        <CardHeader>
          <CardTitle>Electronics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border p-2 text-left font-medium">Component</th>
                  <th className="border border-border p-2 text-center font-medium">Before</th>
                  <th className="border border-border p-2 text-center font-medium">After</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-medium">Volume Pot</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.volumePotBefore || ''}
                      onChange={(e) => updateField('volumePotBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.volumePotAfter || ''}
                      onChange={(e) => updateField('volumePotAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Treble BP Cap</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.trebleBPCapBefore || ''}
                      onChange={(e) => updateField('trebleBPCapBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.trebleBPCapAfter || ''}
                      onChange={(e) => updateField('trebleBPCapAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Tone Pot</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.tonePotBefore || ''}
                      onChange={(e) => updateField('tonePotBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.tonePotAfter || ''}
                      onChange={(e) => updateField('tonePotAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Tone Cap</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.toneCapBefore || ''}
                      onChange={(e) => updateField('toneCapBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.toneCapAfter || ''}
                      onChange={(e) => updateField('toneCapAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Bridge Ground</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.bridgeGroundBefore || ''}
                      onChange={(e) => updateField('bridgeGroundBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.bridgeGroundAfter || ''}
                      onChange={(e) => updateField('bridgeGroundAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Bridge Pickup</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.bridgePickupBefore || ''}
                      onChange={(e) => updateField('bridgePickupBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.bridgePickupAfter || ''}
                      onChange={(e) => updateField('bridgePickupAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Middle Pickup</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.middlePickupBefore || ''}
                      onChange={(e) => updateField('middlePickupBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.middlePickupAfter || ''}
                      onChange={(e) => updateField('middlePickupAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Neck Pickup</td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.neckPickupBefore || ''}
                      onChange={(e) => updateField('neckPickupBefore', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      value={formData.neckPickupAfter || ''}
                      onChange={(e) => updateField('neckPickupAfter', e.target.value)}
                      className="border-0 text-center"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional notes (N/A = Not Applicable, NC = No Change, CNV = Could Not Verify)..."
            rows={4}
            className="border-border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
