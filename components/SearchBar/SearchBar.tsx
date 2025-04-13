import React from 'react';

interface SearchBarProps {
  search: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, handleChange }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
