import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface SearchInputProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function SearchInput({ onSearchChange, placeholder = "Search pages..." }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);

  useInput((input, key) => {
    if (!isActive) {
      if (input === "/") {
        setIsActive(true);
        return;
      }
      return;
    }

    if (key.escape) {
      setIsActive(false);
      setQuery("");
      onSearchChange("");
      return;
    }

    if (key.return) {
      setIsActive(false);
      return;
    }

    if (key.backspace || key.delete) {
      const newQuery = query.slice(0, -1);
      setQuery(newQuery);
      onSearchChange(newQuery);
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      const newQuery = query + input;
      setQuery(newQuery);
      onSearchChange(newQuery);
    }
  });

  return (
    <Box marginBottom={1}>
      <Text color="yellow">🔍 </Text>
      <Text color={isActive ? "white" : "gray"}>
        {isActive ? (
          <>Search: {query}|</>
        ) : (
          <>Press '/' to {placeholder.toLowerCase().replace('...', '')}</>
        )}
      </Text>
      {query && !isActive && (
        <Text color="green"> (filtering: "{query}")</Text>
      )}
    </Box>
  );
}