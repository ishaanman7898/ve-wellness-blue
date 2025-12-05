import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Admin() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard route
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) navigate("/login");
  }, [navigate]);

  // Load from public/products.csv by default
  useEffect(() => {
    fetch("/products.csv")
      .then((r) => r.text())
      .then((text) => {
        const { headers: h, rows: rws } = parseCSV(text);
        setHeaders(h);
        setRows(rws);
      })
      .catch(() => {
        setHeaders([]);
        setRows([]);
      });
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((r) => r.join(" ").toLowerCase().includes(term));
  }, [rows, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const onCellChange = (rIdx: number, cIdx: number, val: string) => {
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[rIdx]) next[rIdx] = [];
      next[rIdx][cIdx] = val;
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, new Array(headers.length).fill("")]);

  const importCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const { headers: h, rows: rws } = parseCSV(text);
      setHeaders(h);
      setRows(rws);
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const csv = toCSV(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex-grow">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Product Sheet</h1>
          <div className="flex gap-2">
            <Input
              placeholder="Search rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCSV(f);
                e.currentTarget.value = "";
              }}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Import CSV</Button>
            <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
            <Button variant="secondary" onClick={addRow}>Add Row</Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/30">
                    {headers.map((_, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 align-top">
                        <input
                          className="w-full bg-transparent border border-border/60 focus:border-primary rounded-md px-2 py-1 text-sm"
                          value={row[cIdx] ?? ""}
                          onChange={(e) => onCellChange(rows.indexOf(row), cIdx, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Note: This is an in-browser editor. Use Export to download an updated CSV and replace <code>public/products.csv</code> to apply site-wide.
        </p>
      </div>
      <Footer />
    </div>
  );
}

// --- CSV helpers ---
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitCSVLine(lines[0]);
  const rows = lines.slice(1).map(splitCSVLine).map((r) => {
    // normalize length to headers
    if (r.length < headers.length) return [...r, ...new Array(headers.length - r.length).fill("")];
    if (r.length > headers.length) return r.slice(0, headers.length);
    return r;
  });
  return { headers, rows };
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function toCSV(headers: string[], rows: string[][]): string {
  const esc = (v: string) => {
    if (v == null) return "";
    const needs = /[",\n]/.test(v);
    const s = String(v).replace(/"/g, '""');
    return needs ? `"${s}"` : s;
  };
  const head = headers.map(esc).join(",");
  const body = rows.map((r) => r.slice(0, headers.length).map(esc).join(",")).join("\n");
  return `${head}\n${body}`;
}
