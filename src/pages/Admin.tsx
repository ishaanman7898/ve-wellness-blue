import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Download,
  Upload,
  LogOut,
  Search,
  Package,
  Edit3,
  Save,
  X,
  BarChart3,
  ShoppingBag,
  DollarSign,
  Layers,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  ShoppingCart,
  ArrowRight,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  FileText
} from "lucide-react";

interface ProductData {
  id: string;
  category: string;
  name: string;
  sku: string;
  color: string;
  hexColor: string;
  price: string;
  link: string;
  status: string;
  description?: string;
  parentProduct?: string;
  relatedProducts?: string[];
  image?: string;
}

interface AnalyticsData {
  pageViews: number;
  productViews: Record<string, number>;
  addToCart: Record<string, number>;
  checkouts: Record<string, number>;
  conversions: number;
  totalRevenue: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "analytics" | "hierarchy">("dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingRow, setUploadingRow] = useState<number | null>(null);

  // Analytics state (simulated)
  const [analytics] = useState<AnalyticsData>({
    pageViews: 12847,
    productViews: {},
    addToCart: {},
    checkouts: {},
    conversions: 847,
    totalRevenue: 24589.99
  });

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

  // Stats
  const stats = useMemo(() => {
    const categories = new Set(rows.map(r => r[0]));
    const totalProducts = rows.length;
    const totalValue = rows.reduce((sum, r) => sum + parseFloat(r[5]?.replace(/[^0-9.]/g, '') || '0'), 0);
    const avgPrice = totalProducts > 0 ? (totalValue / totalProducts) : 0;
    return {
      totalProducts,
      categories: categories.size,
      avgPrice: avgPrice.toFixed(2),
      totalValue: totalValue.toFixed(2)
    };
  }, [rows]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[rowIdx] = [...newRows[rowIdx]];
      newRows[rowIdx][colIdx] = value;
      return newRows;
    });
  };

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    setEditingCell({ row: rowIdx, col: colIdx });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const deleteRow = (idx: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setRows(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const addRow = () => {
    const newRow = new Array(headers.length).fill("");
    setRows(prev => [...prev, newRow]);
  };

  const duplicateRow = (idx: number) => {
    const newRow = [...rows[idx]];
    newRow[2] = newRow[2] + "-COPY"; // Modify SKU
    setRows(prev => [...prev.slice(0, idx + 1), newRow, ...prev.slice(idx + 1)]);
  };

  const importCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const { headers: h, rows: rws } = parseCSV(text);
      setHeaders(h);
      setRows(rws);
      alert(`Imported ${rws.length} products successfully!`);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, rowIdx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      // Assuming image path goes in a specific column (would need to add this column)
      alert(`Image "${file.name}" ready to upload for row ${rowIdx + 1}. \n\nNote: In production, this would upload to your server and save the URL.`);
    }
    e.target.value = "";
    setUploadingRow(null);
  };

  // Group products by parent/group
  const productHierarchy = useMemo(() => {
    const groups: Record<string, string[][]> = {};
    rows.forEach((row, idx) => {
      const groupName = row[1]?.split(' - ')[0] || row[1] || 'Ungrouped';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push([...row, String(idx)]);
    });
    return groups;
  }, [rows]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 pt-52 pb-20 flex-grow">
        {/* Header */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Admin <span className="text-glacier">Portal</span>
            </h1>
            <p className="text-muted-foreground">Complete control over your store</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "dashboard" ? "bg-glacier text-white" : "bg-muted hover:bg-muted/80"
              }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "products" ? "bg-glacier text-white" : "bg-muted hover:bg-muted/80"
              }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "hierarchy" ? "bg-glacier text-white" : "bg-muted hover:bg-muted/80"
              }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Product Hierarchy
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "analytics" ? "bg-glacier text-white" : "bg-muted hover:bg-muted/80"
              }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-xl p-6 border border-border">
                <ShoppingBag className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Total Products</p>
                <p className="font-display text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border">
                <Layers className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Categories</p>
                <p className="font-display text-3xl font-bold">{stats.categories}</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border">
                <DollarSign className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Average Price</p>
                <p className="font-display text-3xl font-bold">${stats.avgPrice}</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border">
                <TrendingUp className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Total Inventory Value</p>
                <p className="font-display text-3xl font-bold">${stats.totalValue}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setActiveTab("products")} className="gap-2">
                  <Package className="w-4 h-4" />
                  Manage Products
                </Button>
                <Button variant="outline" onClick={exportCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Products
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import Products
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("analytics")} className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Recent Products */}
            <div className="glass rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold mb-4">Recent Products</h2>
              <div className="space-y-4">
                {rows.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-glacier/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-glacier" />
                      </div>
                      <div>
                        <p className="font-semibold">{row[1]}</p>
                        <p className="text-sm text-muted-foreground">{row[0]} • SKU: {row[2]}</p>
                      </div>
                    </div>
                    <p className="font-bold text-glacier">${row[5]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab - Excel-like Sheet */}
        {activeTab === "products" && (
          <>
            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
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
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (uploadingRow !== null) {
                      handleImageUpload(e, uploadingRow);
                    }
                  }}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
                <Button variant="outline" onClick={exportCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button onClick={addRow} className="gap-2 bg-glacier hover:bg-glacier/90">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Excel-like Spreadsheet */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-auto max-h-[600px]">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/70 sticky top-0 z-10">
                    <tr>
                      <th className="border border-border/50 px-2 py-2 text-left text-xs font-bold text-muted-foreground uppercase w-10">
                        #
                      </th>
                      {headers.map((h, i) => (
                        <th key={i} className="border border-border/50 px-2 py-2 text-left text-xs font-bold text-muted-foreground uppercase min-w-[100px]">
                          {h}
                        </th>
                      ))}
                      <th className="border border-border/50 px-2 py-2 text-center text-xs font-bold text-muted-foreground uppercase w-24">
                        Image
                      </th>
                      <th className="border border-border/50 px-2 py-2 text-center text-xs font-bold text-muted-foreground uppercase w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, rIdx) => {
                      const actualIdx = rows.indexOf(row);

                      return (
                        <tr key={rIdx} className="hover:bg-muted/20">
                          <td className="border border-border/50 px-2 py-1 text-xs text-muted-foreground bg-muted/30">
                            {actualIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => {
                            const isEditing = editingCell?.row === actualIdx && editingCell?.col === cIdx;
                            return (
                              <td
                                key={cIdx}
                                className="border border-border/50 px-0 py-0"
                                onClick={() => handleCellClick(actualIdx, cIdx)}
                              >
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    className="w-full h-full px-2 py-1 bg-white dark:bg-background border-2 border-glacier outline-none text-sm"
                                    value={cell}
                                    onChange={(e) => handleCellChange(actualIdx, cIdx, e.target.value)}
                                    onBlur={handleCellBlur}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCellBlur();
                                      if (e.key === 'Tab') {
                                        e.preventDefault();
                                        handleCellBlur();
                                        if (cIdx < headers.length - 1) {
                                          setEditingCell({ row: actualIdx, col: cIdx + 1 });
                                        }
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="px-2 py-1 text-sm min-h-[32px] cursor-text hover:bg-glacier/5">
                                    {cIdx === 4 && cell ? (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border border-border"
                                          style={{ backgroundColor: cell }}
                                        />
                                        <span>{cell}</span>
                                      </div>
                                    ) : (
                                      cell || <span className="text-muted-foreground/50">-</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-border/50 px-2 py-1 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setUploadingRow(actualIdx);
                                imageInputRef.current?.click();
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="border border-border/50 px-2 py-1">
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => duplicateRow(actualIdx)}
                                className="h-8 w-8 p-0"
                                title="Duplicate"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                                onClick={() => deleteRow(actualIdx)}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              <strong>Tip:</strong> Click any cell to edit. Press Tab to move to next cell. Use Export to save changes permanently.
            </p>
          </>
        )}

        {/* Product Hierarchy Tab */}
        {activeTab === "hierarchy" && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold mb-2">Product Hierarchy</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Organize products by group (e.g., main product with color variants)
              </p>

              <div className="space-y-4">
                {Object.entries(productHierarchy).map(([groupName, products]) => (
                  <div key={groupName} className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-glacier" />
                        <span className="font-semibold">{groupName}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {products.length} variant{products.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Edit3 className="w-3 h-3" />
                        Edit Group
                      </Button>
                    </div>
                    <div className="divide-y divide-border">
                      {products.map((product, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-6 h-6 rounded-full border border-border"
                              style={{ backgroundColor: product[4] || '#ccc' }}
                            />
                            <div>
                              <p className="text-sm font-medium">{product[3] || 'No color'}</p>
                              <p className="text-xs text-muted-foreground">SKU: {product[2]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold">${product[5]}</span>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <ImageIcon className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <LinkIcon className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <FileText className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-muted/30 px-4 py-2 flex gap-2">
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        <Palette className="w-3 h-3" />
                        Add Color Variant
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        <LinkIcon className="w-3 h-3" />
                        Set Related Products
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        <FileText className="w-3 h-3" />
                        Edit Description
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-xl p-6 border border-border">
                <Eye className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Total Page Views</p>
                <p className="font-display text-3xl font-bold">{analytics.pageViews.toLocaleString()}</p>
                <p className="text-xs text-emerald-500 mt-2">↑ 12% vs last week</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border">
                <Users className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Unique Visitors</p>
                <p className="font-display text-3xl font-bold">4,521</p>
                <p className="text-xs text-emerald-500 mt-2">↑ 8% vs last week</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border">
                <ShoppingCart className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Conversions</p>
                <p className="font-display text-3xl font-bold">{analytics.conversions}</p>
                <p className="text-xs text-emerald-500 mt-2">6.6% conversion rate</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border">
                <DollarSign className="w-10 h-10 text-glacier mb-4" />
                <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
                <p className="font-display text-3xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-500 mt-2">↑ 24% vs last week</p>
              </div>
            </div>

            {/* Funnel */}
            <div className="glass rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold mb-6">Checkout Funnel</h2>
              <div className="flex items-center justify-between gap-4">
                {[
                  { label: "Page Views", value: 12847, percent: 100 },
                  { label: "Product Views", value: 5423, percent: 42 },
                  { label: "Add to Cart", value: 1847, percent: 14 },
                  { label: "Checkout Started", value: 1203, percent: 9 },
                  { label: "Completed Purchase", value: 847, percent: 6.6 },
                ].map((step, idx, arr) => (
                  <div key={step.label} className="flex-1 text-center">
                    <div
                      className="bg-gradient-to-b from-glacier/80 to-glacier/40 rounded-lg mx-auto mb-3"
                      style={{
                        width: `${Math.max(40, step.percent)}%`,
                        height: '80px',
                        minWidth: '60px'
                      }}
                    />
                    <p className="font-bold text-lg">{step.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{step.label}</p>
                    <p className="text-xs text-glacier">{step.percent}%</p>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto mt-2 hidden lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6 border border-border">
                <h2 className="font-display text-xl font-bold mb-4">Top Products by Views</h2>
                <div className="space-y-4">
                  {rows.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">{idx + 1}.</span>
                        <span className="font-medium">{row[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-glacier"
                            style={{ width: `${100 - idx * 15}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{(1200 - idx * 180).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-6 border border-border">
                <h2 className="font-display text-xl font-bold mb-4">Top Products by Revenue</h2>
                <div className="space-y-4">
                  {rows.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">{idx + 1}.</span>
                        <span className="font-medium">{row[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${100 - idx * 12}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">${((45 - idx * 5) * 100).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="glass rounded-xl p-6 border border-border">
              <h2 className="font-display text-xl font-bold mb-4">Traffic Sources</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { source: "Direct", visits: 4521, percent: 35, color: "bg-glacier" },
                  { source: "Social Media", visits: 3842, percent: 30, color: "bg-purple-500" },
                  { source: "Search (Organic)", visits: 2576, percent: 20, color: "bg-emerald-500" },
                  { source: "Referral", visits: 1908, percent: 15, color: "bg-orange-500" },
                ].map(source => (
                  <div key={source.source} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm text-muted-foreground">{source.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${source.color}`} style={{ width: `${source.percent}%` }} />
                    </div>
                    <p className="text-sm text-muted-foreground">{source.visits.toLocaleString()} visits</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Order Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 border border-border text-center">
                <p className="text-muted-foreground text-sm mb-2">Average Order Value</p>
                <p className="font-display text-4xl font-bold text-glacier">$29.03</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border text-center">
                <p className="text-muted-foreground text-sm mb-2">Avg Items Per Order</p>
                <p className="font-display text-4xl font-bold text-glacier">2.4</p>
              </div>
              <div className="glass rounded-xl p-6 border border-border text-center">
                <p className="text-muted-foreground text-sm mb-2">Cart Abandonment Rate</p>
                <p className="font-display text-4xl font-bold text-red-500">29.5%</p>
              </div>
            </div>
          </div>
        )}
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
