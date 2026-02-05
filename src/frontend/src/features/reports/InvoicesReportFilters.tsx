import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Customer } from '@/backend';

type FilterType = 'all' | 'paid' | 'unpaid';

interface InvoicesReportFiltersProps {
  // Payment status filter
  statusFilter: FilterType;
  onStatusFilterChange: (filter: FilterType) => void;
  
  // Customer filter
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  customers: Customer[];
  
  // Date range filter
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  
  // Clear all filters
  onClearFilters: () => void;
}

export default function InvoicesReportFilters({
  statusFilter,
  onStatusFilterChange,
  selectedCustomerId,
  onCustomerChange,
  customers,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: InvoicesReportFiltersProps) {
  const hasActiveFilters = 
    statusFilter !== 'all' || 
    selectedCustomerId !== 'all' || 
    startDate !== null || 
    endDate !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Payment Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange('paid')}
          >
            Paid
          </Button>
          <Button
            variant={statusFilter === 'unpaid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange('unpaid')}
          >
            Unpaid
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Customer Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Customer:</span>
          <Select value={selectedCustomerId} onValueChange={onCustomerChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id.toString()} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created:</span>
          
          {/* Start Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => onStartDateChange(date || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">to</span>

          {/* End Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => onEndDateChange(date || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
