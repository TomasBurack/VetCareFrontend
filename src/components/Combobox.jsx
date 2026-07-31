import { useEffect, useRef, useState } from 'react';

export function Combobox({ options, value, onChange, placeholder, disabled }) {
  const [inputText, setInputText] = useState(value ?? '');
  const [open, setOpen] = useState(false);
  const [lastSyncedValue, setLastSyncedValue] = useState(value);
  const containerRef = useRef(null);
  const commitOrRevertRef = useRef(() => {});

  if (value !== lastSyncedValue) {
    setLastSyncedValue(value);
    setInputText(value ?? '');
  }

  function commitOrRevert() {
    const match = options.find((o) => o.toLowerCase() === inputText.toLowerCase());
    if (match) {
      setInputText(match);
      if (match !== value) onChange(match);
    } else {
      setInputText(value ?? '');
      if (value) onChange('');
    }
  }
  useEffect(() => {
    commitOrRevertRef.current = commitOrRevert;
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        commitOrRevertRef.current();
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectOption(option) {
    setInputText(option);
    onChange(option);
    setOpen(false);
  }

  const filtered = options.filter((o) => o.toLowerCase().includes(inputText.toLowerCase()));

  return (
    <div className="combobox" ref={containerRef}>
      <input
        className="f"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        disabled={disabled}
        placeholder={placeholder}
        value={inputText}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInputText(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            commitOrRevert();
            setOpen(false);
          }
        }}
        onBlur={() => {
          // el click en una opción se procesa antes de que el blur cierre la lista
          setTimeout(() => {
            commitOrRevert();
            setOpen(false);
          }, 0);
        }}
      />
      {open && filtered.length > 0 && (
        <ul className="combobox-list">
          {filtered.map((option) => (
            <li key={option} role="option" aria-selected={option === value} onMouseDown={() => selectOption(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
