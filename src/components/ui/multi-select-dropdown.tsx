
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

interface MultiSelectDropdownProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
  disabled = false,
  className,
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("w-full justify-between h-auto min-h-10", className)}
        >
          <div className="flex gap-1 flex-wrap">
             {selectedValues.length > 0 ? (
                isAllSelected ? (
                    <Badge variant="secondary" className="rounded-sm px-2 py-1">{t('all_versions')}</Badge>
                ) : (
                    <>
                      <Badge variant="secondary" className="rounded-sm px-2 py-1">{t('selected_versions', {count: selectedValues.length})}</Badge>
                    </>
                )
            ) : placeholder}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
       <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2">
            <Button
              variant="ghost"
              onClick={handleSelectAll}
              className="w-full justify-start px-2"
            >
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                className="mr-2"
              />
              {isAllSelected ? t('clear_selection') : t('select_all')}
            </Button>
          </div>
          <Separator />
          <ScrollArea className="h-60">
            <div className="p-1">
              {options.map((option) => (
                 <Button
                  variant="ghost"
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="w-full justify-start px-2 font-normal"
                >
                   <Checkbox
                      checked={selectedValues.includes(option.value)}
                      className="mr-2"
                   />
                  <span className="truncate">
                    {option.label}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
       </PopoverContent>
    </Popover>
  );
}
