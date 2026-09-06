import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Dialog } from '../../components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Plus,
  Minus,
  Info,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export function PortalProductsPage() {
  const { user, currency } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [selectedItems, setSelectedItems] = React.useState<Record<string, { qty: number; product: any }>>({});
  const [activeDetailProduct, setActiveDetailProduct] = React.useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });

  const products = data?.data || [];

  const createQuoteMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await quotesApi.createQuote(payload, user?.id, user?.name);
      if (!res.success) throw new Error(res.error || 'Failed to assemble quotation');
      return res.data;
    },
    onSuccess: (createdQuote) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      toast.success(`Commercial Quotation ${createdQuote?.quoteNumber || ''} generated successfully!`);
      navigate(`/portal/quotes/${createdQuote?.id || ''}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create quotation');
    },
  });

  const handleToggleSelect = (prod: any) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[prod.id]) {
        delete copy[prod.id];
      } else {
        copy[prod.id] = { qty: 5, product: prod };
      }
      return copy;
    });
  };

  const handleUpdateQty = (prodId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[prodId];
      if (!current) return prev;
      const nextQty = Math.max(1, current.qty + delta);
      return {
        ...prev,
        [prodId]: { ...current, qty: nextQty },
      };
    });
  };

  const handleRequestQuote = () => {
    const lines = Object.values(selectedItems).map(({ qty, product }) => ({
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: Number(product.basePrice) || 25000,
      discountPercentage: 0,
    }));

    if (lines.length === 0) {
      toast.error('Please select at least one product line item.');
      return;
    }

    createQuoteMutation.mutate({
      customerId: user?.id || 'cust-1',
      priceListId: 'pl-enterprise-standard',
      paymentTerms: 'NET_30',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      notes: `Direct portal proposal request with ${lines.length} items.`,
      lines,
    });
  };

  // Categories extraction
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.categoryName || 'General')))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.categoryName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedCount = Object.keys(selectedItems).length;
  const estimatedSubtotal = Object.values(selectedItems).reduce(
    (sum, { qty, product }) => sum + qty * (Number(product.basePrice) || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
            <Package className="w-6 h-6 text-[#714b67]" />
            Enterprise Hardware & Software Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Select items and configure target quantities to generate an official commercial proposal in Indian Rupees (₹ INR).
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search products by title, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all whitespace-nowrap text-xs ${
                selectedCategory === cat
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading && (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading catalog items...</div>
        )}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-400">No matching catalog items found.</div>
        )}
        {!isLoading &&
          filteredProducts.map((p) => {
            const isSelected = !!selectedItems[p.id];
            const currentQty = selectedItems[p.id]?.qty || 5;

            return (
              <Card
                key={p.id}
                className={`border bg-white transition-all flex flex-col justify-between shadow-subtle rounded-2xl overflow-hidden ${
                  isSelected ? 'border-[#714b67] ring-2 ring-[#714b67]/20 shadow-md' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {p.imageUrl && (
                    <div className="relative overflow-hidden group">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-44 object-cover border-b border-slate-100 transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        onClick={() => setActiveDetailProduct(p)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-white shadow-xs"
                        title="View specifications"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <CardHeader className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="indigo" size="sm">
                        {p.categoryName || 'Enterprise'}
                      </Badge>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{p.sku}</span>
                    </div>
                    <CardTitle className="text-sm font-bold text-[#252733] leading-snug font-display">
                      {p.name}
                    </CardTitle>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-sans">
                      {p.description}
                    </p>
                  </CardHeader>
                </div>

                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between font-mono pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-sans">Standard Price:</span>
                    <span className="text-base font-bold text-[#252733] font-mono">
                      {formatCurrency(p.basePrice, 'INR')}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-semibold font-sans">Target Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(p.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs text-[#252733] w-6 text-center">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(p.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    variant={isSelected ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleSelect(p)}
                    className={`w-full gap-1.5 text-xs rounded-xl ${
                      isSelected
                        ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#714b67]" />
                        <span>Added to Proposal Selection</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-3.5 h-3.5" />
                        <span>Select for Proposal</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Floating Bottom Action Drawer for Quotation Assembly */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#714b67] text-white flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm font-display text-white">
                {selectedCount} Product Line{selectedCount > 1 ? 's' : ''} Selected
              </div>
              <div className="text-slate-400 text-xs font-mono">
                Estimated Valuation: <strong className="text-emerald-400 font-bold">{formatCurrency(estimatedSubtotal, 'INR')}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems({})}
              className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleRequestQuote}
              disabled={createQuoteMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-md gap-1.5 px-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{createQuoteMutation.isPending ? 'Generating Proposal...' : 'Generate Commercial Proposal'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Product Detail Dialog */}
      <Dialog
        isOpen={!!activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#714b67]" />
            <span className="font-display font-bold text-[#252733]">{activeDetailProduct?.name}</span>
          </div>
        }
      >
        {activeDetailProduct && (
          <div className="space-y-4 pt-2 font-sans text-xs">
            {activeDetailProduct.imageUrl && (
              <img
                src={activeDetailProduct.imageUrl}
                alt={activeDetailProduct.name}
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
            )}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Product SKU:</span>
                <span className="font-mono font-bold text-[#252733]">{activeDetailProduct.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-[#714b67]">{activeDetailProduct.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Standard List Price:</span>
                <span className="font-mono font-bold text-[#252733] text-sm">
                  {formatCurrency(activeDetailProduct.basePrice, 'INR')}
                </span>
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">Description & Specifications:</span>
              <p className="text-slate-600 leading-relaxed">{activeDetailProduct.description}</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setActiveDetailProduct(null)} className="bg-[#714b67] text-white">
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default PortalProductsPage;
