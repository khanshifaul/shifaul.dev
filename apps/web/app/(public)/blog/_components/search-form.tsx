"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchFormProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
}

const SearchForm = ({ value, onChange, onSubmit, placeholder = "SEARCH_LOGS..." }: SearchFormProps) => {
  const [localQuery, setLocalQuery] = useState("");

  const isControlled = value !== undefined;
  const query = isControlled ? value : localQuery;

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setLocalQuery(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else {
      console.log({ query });
    }
  };

  return (
    <div className="p-4 bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-zinc-900 rounded-sm transition-all duration-500">
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center w-full gap-2"
      >
        <div className="flex-1 relative">
          <Input
            value={query}
            onChange={handleQueryChange}
            placeholder={placeholder}
            className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 rounded-none h-10 font-mono text-xs focus:ring-1 focus:ring-green-500/50"
            maxLength={255}
            aria-label="Search articles"
          />
        </div>
        <Button
          type="submit"
          className="h-10 w-10 bg-zinc-950 dark:bg-green-500 text-white dark:text-black rounded-none hover:bg-zinc-800 dark:hover:bg-green-400 transition-colors shrink-0"
          aria-label="Search"
        >
          <FaSearch className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default SearchForm;
