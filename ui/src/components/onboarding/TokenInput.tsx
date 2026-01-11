"use client";

import { useState, useCallback, KeyboardEvent, useRef } from "react";
import { KTag } from "@/components/ui";

interface TokenInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  suggestions?: string[];
}

export function TokenInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  maxItems = 10,
  suggestions = [],
}: TokenInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addToken = useCallback(
    (token: string) => {
      const trimmed = token.trim();
      if (!trimmed) return;
      if (value.includes(trimmed)) return;
      if (value.length >= maxItems) return;

      onChange([...value, trimmed]);
      setInputValue("");
    },
    [value, onChange, maxItems]
  );

  const removeToken = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addToken(inputValue);
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeToken(value.length - 1);
      }
    },
    [inputValue, addToken, value.length, removeToken]
  );

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !value.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const canAddMore = value.length < maxItems;

  return (
    <div className="space-y-2">
      {/* Tokens display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((token, index) => (
            <KTag
              key={`${token}-${index}`}
              variant="filled"
              className="flex items-center gap-1 pr-1"
            >
              {token}
              <button
                type="button"
                onClick={() => removeToken(index)}
                className="
                  ml-1 p-0.5 rounded hover:bg-kairo-bg-hover
                  text-kairo-fg-muted hover:text-kairo-fg
                  transition-colors
                "
                aria-label={`Remove ${token}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </KTag>
          ))}
        </div>
      )}

      {/* Input field */}
      {canAddMore && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="
              w-full px-3 py-2 rounded-lg text-[13px]
              bg-kairo-bg-elevated border border-kairo-border-subtle
              text-kairo-fg placeholder:text-kairo-fg-subtle
              focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
            "
          />

          {/* Suggestions dropdown */}
          {showSuggestions &&
            inputValue &&
            filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 py-1 bg-kairo-bg-panel border border-kairo-border-subtle rounded-lg shadow-lg">
                {filteredSuggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addToken(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="
                      w-full px-3 py-1.5 text-left text-[13px]
                      text-kairo-fg-muted hover:bg-kairo-bg-elevated hover:text-kairo-fg
                      transition-colors
                    "
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
        </div>
      )}

      {/* Counter */}
      <p className="text-[10px] text-kairo-fg-subtle">
        {value.length}/{maxItems} items
      </p>
    </div>
  );
}

TokenInput.displayName = "TokenInput";
