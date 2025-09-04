'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { Car, MapPin, Calendar, GripVertical, SlidersHorizontal } from 'lucide-react';
import type { FilterOptions, Filters } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

interface DashboardSidebarProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  filterOptions: FilterOptions;
}

const DashboardSidebar: FC<DashboardSidebarProps> = ({ filters, onFilterChange, filterOptions }) => {
  const handleSelectChange = (key: keyof Filters, value: string) => {
    const newFilters: Partial<Filters> = {[key]: value};
    if (key === 'state') newFilters.city = 'all';
    if (key === 'manufacturer') newFilters.model = 'all';
    if (key === 'model') newFilters.version = 'all';
    onFilterChange(newFilters);
  };
  
  const handleDateChange = (dateRange: DateRange | undefined) => {
    onFilterChange({ dateRange: { from: dateRange?.from, to: dateRange?.to }});
  }

  const clearFilters = () => {
    onFilterChange({
      state: 'all',
      city: 'all',
      manufacturer: 'all',
      model: 'all',
      version: 'all',
      category: 'all',
      dateRange: { from: undefined, to: undefined },
    });
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-card">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold text-primary">
          <Car className="h-6 w-6" />
          <span className="text-lg text-foreground">Vehicle Insights</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Filters</h2>
          <Accordion type="multiple" defaultValue={['location', 'vehicle', 'time']} className="w-full">
            <AccordionItem value="location">
              <AccordionTrigger>
                <div className='flex items-center gap-2'>
                  <MapPin className="h-4 w-4" /> Location
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <Select value={filters.state} onValueChange={(value) => handleSelectChange('state', value)}>
                  <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {filterOptions.states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.city} onValueChange={(value) => handleSelectChange('city', value)}>
                  <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {filterOptions.cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="vehicle">
              <AccordionTrigger>
                <div className='flex items-center gap-2'>
                  <SlidersHorizontal className="h-4 w-4" /> Vehicle
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <Select value={filters.manufacturer} onValueChange={(value) => handleSelectChange('manufacturer', value)}>
                  <SelectTrigger><SelectValue placeholder="Select Manufacturer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Manufacturers</SelectItem>
                    {filterOptions.manufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <Select value={filters.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.model} onValueChange={(value) => handleSelectChange('model', value)}>
                  <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {filterOptions.models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.version} onValueChange={(value) => handleSelectChange('version', value)}>
                  <SelectTrigger><SelectValue placeholder="Select Version" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Versions</SelectItem>
                    {filterOptions.versions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="time">
              <AccordionTrigger>
                <div className='flex items-center gap-2'>
                  <Calendar className="h-4 w-4" /> Time Period
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, 'LLL dd, y')} - {format(filters.dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(filters.dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarIcon
                      mode="range"
                      selected={filters.dateRange}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
       <div className="mt-auto p-4 border-t">
        <Button variant="ghost" className="w-full justify-center" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
