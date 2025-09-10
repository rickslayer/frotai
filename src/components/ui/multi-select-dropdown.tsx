
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const getLabel = (value: string) => {
      const option = options.find(o => o.value === value);
      return option ? option.label : value;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between h-auto", className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedValues.length > 0
              ? selectedValues.map((value) => (
                  <Badge
                    variant="secondary"
                    key={value}
                    className="rounded-sm px-2 py-1"
                  >
                    {getLabel(value)}
                  </Badge>
                ))
              : placeholder}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <ScrollArea className="max-h-60">
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
