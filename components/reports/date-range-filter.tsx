'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DateRangePreset } from '@/lib/utils/reports-utils';
import { formatDateRangeDisplay } from '@/lib/utils/reports-utils';

interface DateRangeFilterProps {
  preset: DateRangePreset;
  customStartDate: Date | null;
  customEndDate: Date | null;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomStartChange: (date: Date | null) => void;
  onCustomEndChange: (date: Date | null) => void;
}

export function DateRangeFilter({
  preset,
  customStartDate,
  customEndDate,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
}: DateRangeFilterProps) {
  const presets: Array<{ value: DateRangePreset; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onCustomStartChange(new Date(value));
    } else {
      onCustomStartChange(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onCustomEndChange(new Date(value));
    } else {
      onCustomEndChange(null);
    }
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        {/* Date Range Display */}
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium md:text-sm">
            {formatDateRangeDisplay(preset, customStartDate, customEndDate)}
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
          {presets.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={preset === p.value ? 'default' : 'outline'}
              onClick={() => onPresetChange(p.value)}
              className="text-xs"
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        {preset === 'custom' && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={formatDateForInput(customStartDate)}
                onChange={handleStartDateChange}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={formatDateForInput(customEndDate)}
                onChange={handleEndDateChange}
                className="text-xs"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
