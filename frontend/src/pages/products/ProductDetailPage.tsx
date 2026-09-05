import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Package, Lock, ShieldAlert } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency, user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id || 'prod-1'),
  });

  const product = data?.data;
  const canViewCost = can(user, 'cost.view');

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-400">Loading product details...</span>
      </div>
    );
  }

  const marginPct = ((product.basePrice - product.costPrice) / product.basePrice) * 100;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Products & Catalog', href: '/products' },
          { label: product.name },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              {product.name}
            </h1>
            <Badge variant="indigo">{product.categoryName}</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">SKU: {product.sku}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/sales/quotes/new')}
            className="gap-1.5 shadow-subtle bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <Package className="w-4 h-4" />
            Add to new quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-[#e5e7eb]">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#252733] font-display">
                <Package className="w-4 h-4 text-[#714b67]" />
                Product Specification & Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed bg-[#f3f4f6] p-3 rounded-xl border border-[#e5e7eb]">
                {product.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 font-mono">
                <div className="p-3.5 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb]">
                  <span className="text-slate-400 block text-[10px]">Selling Price (List)</span>
                  <span className="text-base font-bold text-[#252733]">{formatCurrency(product.basePrice, currency)}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb]">
                  <span className="text-slate-400 block text-[10px]">Cost Price</span>
                  {canViewCost ? (
                    <span className="text-base font-bold text-slate-600">{formatCurrency(product.costPrice, currency)}</span>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1 pt-1"><Lock className="w-3 h-3" /> Masked</span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb]">
                  <span className="text-slate-400 block text-[10px]">Baseline Margin</span>
                  {canViewCost ? (
                    <span className="text-base font-bold text-emerald-600">{marginPct.toFixed(1)}%</span>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1 pt-1"><Lock className="w-3 h-3" /> Masked</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Category Discount Limits & Stock */}
        <div className="space-y-4">
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 border-b border-[#e5e7eb]">
              <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <ShieldAlert className="w-3.5 h-3.5 text-[#714b67]" />
                Category Policy Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-slate-500">Max Rep Discount:</span>
                <span className="text-amber-600 font-bold">10.0%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-slate-500">Min Margin Floor:</span>
                <span className="text-emerald-600 font-bold">18.0%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-slate-500">Tax Rate (GST):</span>
                <span className="text-[#252733]">{product.taxRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
