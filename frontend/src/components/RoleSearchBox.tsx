import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  onSelect: () => void;
}

interface RoleSearchBoxProps {
  placeholder: string;
  search: (query: string) => Promise<SearchResult[]>;
}

export function RoleSearchBox({ placeholder, search }: RoleSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await search(value.trim());
        setResults(r);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div ref={ref} className="search-box" style={{ position: "relative", flex: 1, maxWidth: 420 }}>
      <Search size={15} />
      <input
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => query && setOpen(true)}
      />

      {open && (query.trim() || loading) && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
            background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 12, boxShadow: "var(--shadow-md)", maxHeight: 320, overflowY: "auto", zIndex: 30,
          }}
        >
          {loading ? (
            <div style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "var(--color-muted)" }}>Searching…</div>
          ) : results.length === 0 ? (
            <div style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "var(--color-muted)" }}>No matches found.</div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  r.onSelect();
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  display: "block", width: "100%", textAlign: "left", background: "transparent",
                  color: "var(--color-text)", padding: "0.7rem 1rem", fontSize: "0.85rem", fontWeight: 500,
                  borderRadius: 0, borderBottom: "1px solid var(--color-border)",
                }}
              >
                {r.label}
                {r.sublabel && (
                  <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 400, marginTop: 2 }}>
                    {r.sublabel}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}