
"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";
import { Checkbox } from "./checkbox";
import { Label } from "./label";


interface MultiSelectDropdownProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  itemType?: 'version' | 'model';
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
  disabled = false,
  className,
  itemType = 'version'
}: MultiSelectDropdownProps) {
  const { t } = useTranslation();

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]); // Deselect all
    } else {
      onChange(options.map(o => o.value)); // Select all
    }
  };

  const getLabel = (value: string) => {
      const option = options.find(o => o.value === value);
      return option ? option.label : value;
  }

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  const getDisplayValue = () => {
    if (selectedValues.length === 0) return placeholder;

    if (isAllSelected) {
        return itemType === 'version' ? t('all_versions') : t('all_models');
    }

    if (selectedValues.length === 1) {
        return getLabel(selectedValues[0]);
    }
    
    return itemType === 'version' 
      ? t('selected_versions', { count: selectedValues.length })
      : t('selected_models', { count: selectedValues.length });
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("w-full justify-between h-auto min-h-10", className)}
        >
          <div className="flex gap-1 flex-wrap items-center">
             {selectedValues.length > 1 && !isAllSelected ? (
                 <Badge variant="secondary" className="rounded-sm px-2 py-1 font-normal">{getDisplayValue()}</Badge>
             ) : (
                <span className="truncate font-normal">{getDisplayValue()}</span>
             )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
       <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2">
            <div 
              className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
              onClick={handleSelectAll}
            >
               <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="flex-1 cursor-pointer text-sm font-normal">
                 {isAllSelected ? t('clear_selection') : t('select_all')}
              </Label>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-60">
            <div className="p-1">
              {options.map((option) => (
                 <div
                  key={option.value}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(option.value)}
                >
                   <Checkbox
                      id={`item-${option.value}`}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={() => handleSelect(option.value)}
                   />
                  <Label htmlFor={`item-${option.value}`} className="truncate flex-1 cursor-pointer font-normal text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
       </PopoverContent>
    </Popover>
  );
}
