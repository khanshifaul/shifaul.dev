"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as React from "react";
import { LuCheck, LuChevronsUpDown, LuPlus } from "react-icons/lu";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  placeholder?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  options,
  selected,
  onSelectedChange,
  placeholder = "Select options...",
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const toggleSelection = (value: string) => {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((v) => v !== value));
    } else {
      onSelectedChange([...selected, value]);
    }
  };

  // Filter options based on the current query (case-insensitive)
  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const displayLabel =
    selected.length > 0
      ? options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label)
        .join(", ")
      : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayLabel}
          <LuChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className="w-full">
          <CommandInput
            placeholder="Search..."
            className="h-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <CommandList className="w-full">
            {filteredOptions.length === 0 && query ? (
              <CommandItem
                onSelect={() => {
                  toggleSelection(query);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <LuPlus className="mr-2 h-4 w-4" />
              </CommandItem>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      toggleSelection(option.value);
                      // Optional: Clear query on selection
                      setQuery("");
                      setOpen(false);
                    }}
                    className="w-full"
                  >
                    {option.label}
                    <LuCheck
                      className={cn(
                        "ml-auto",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
