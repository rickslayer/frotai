
"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between h-auto min-h-10", className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedValues.length > 0 ? (
                isAllSelected ? (
                    <Badge variant="secondary" className="rounded-sm px-2 py-1">{t('all_versions')}</Badge>
                ) : (
                    selectedValues.map((value) => (
                        <Badge
                            variant="secondary"
                            key={value}
                            className="rounded-sm px-2 py-1"
                        >
                            {getLabel(value)}
                        </Badge>
                    ))
                )
            ) : placeholder}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <ScrollArea className="max-h-60">
            {options.length > 1 && (
                <>
                    <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          handleSelectAll();
                        }}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                isAllSelected ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {isAllSelected ? t('clear_selection') : t('select_all')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            )}
            {options.map((option) => (
            <DropdownMenuItem
                key={option.value}
                onSelect={(e) => {
                    e.preventDefault();
                    handleSelect(option.value);
                }}
            >
                <Check
                className={cn(
                    "mr-2 h-4 w-4",
                    selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                )}
                />
                {option.label}
            </DropdownMenuItem>
            ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
