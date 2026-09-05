import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Product } from '../../types/product';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  Package,
  Lock,
  ShieldAlert,
  Edit2,
  CheckCircle2,
  Boxes,
  Layers,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, user } = useAuthStore();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [basePrice, setBasePrice] = React.useState<number>(0);
  const [costPrice, setCostPrice] = React.useState<number>(0);
  const [stock, setStock] = React.useState<number>(0);
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id || 'prod-1'),
  });

  const product = data?.data;
  const canViewCost = can(user, 'cost.view');
  const canEdit = can(user, 'product.edit');

  React.useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setBasePrice(product.basePrice);
      setCostPrice(product.costPrice);
      setStock(product.totalStockAvailable || 0);
      setDescription(product.description || '');
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Product>) =>
      productsApi.updateProduct(id || 'prod-1', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(res.message || 'Product updated successfully!');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update product');
    },
  });

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-500 font-sans">Loading product specifications...</span>
      </div>
    );
  }

  const marginPct = ((product.basePrice - product.costPrice) / product.basePrice) * 100;
  const isLossMaking = basePrice > 0 && costPrice >= basePrice;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!sku.trim()) errs.sku = 'SKU is required.';
    if (basePrice <= 0) errs.basePrice = 'Selling price must be > 0.';
    if (costPrice <= 0) errs.costPrice = 'Cost price must be > 0.';
    if (costPrice >= basePrice) errs.costPrice = 'Cost cannot exceed selling price.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      basePrice,
      costPrice,
      totalStockAvailable: stock,
      description: description.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Products & Catalog', href: '/products' },
          { label: product.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              {product.name}
            </h1>
            <Badge variant="secondary">{product.categoryName}</Badge>
            {product.type === 'SUBSCRIPTION' ? (
              <Badge variant="indigo">SaaS Cloud Subscription</Badge>
            ) : (
              <Badge variant="success">Physical Hardware</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">Catalog SKU: {product.sku}</p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5 border-slate-200 text-[#252733] font-sans"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Specification
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => navigate('/sales/quotes/new')}
            className="gap-1.5 shadow-subtle bg-[#714b67] hover:bg-[#5e3c54] text-white font-sans"
          >
            <Package className="w-4 h-4" />
            Add to Quotation
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
                Commercial Governance & Hardware Specs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs font-sans">
              <p className="text-slate-600 leading-relaxed bg-[#f3f4f6] p-3.5 rounded-xl border border-[#e5e7eb]">
                {product.description || 'Enterprise grade infrastructure component with 24/7 SLA and hardware warranty.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">List Selling Price</span>
                  <span className="text-base font-bold text-[#252733]">{formatCurrency(product.basePrice, currency)}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Internal Cost Basis</span>
                  {canViewCost ? (
                    <span className="text-base font-bold text-slate-600">{formatCurrency(product.costPrice, currency)}</span>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1 pt-1 font-sans">
                      <Lock className="w-3 h-3 text-slate-400" /> Masked
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Baseline Margin</span>
                  {canViewCost ? (
                    <span className={`text-base font-bold ${marginPct < 18 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {marginPct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1 pt-1 font-sans">
                      <Lock className="w-3 h-3 text-slate-400" /> Masked
                    </span>
                  )}
                </div>
              </div>

              {/* Stock availability banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#714b67]">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#252733] block">Warehouse Stock Allocation</span>
                    <span className="text-slate-500 text-[11px]">Surat Central Logistics & Distribution Hub</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-base font-bold text-[#252733]">
                    {product.type === 'SUBSCRIPTION' ? 'Infinite Cloud SaaS' : `${product.totalStockAvailable} Units Available`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Category Discount Limits & Policy */}
        <div className="space-y-4">
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl font-sans">
            <CardHeader className="p-4 border-b border-[#e5e7eb]">
              <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <ShieldAlert className="w-3.5 h-3.5 text-[#714b67]" />
                Commercial Deal Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-slate-500 font-sans">Max Sales Rep Discount:</span>
                <span className="text-amber-600 font-bold">10.0%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-slate-500 font-sans">Min Margin Floor:</span>
                <span className="text-emerald-600 font-bold">18.0%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-slate-500 font-sans">Standard GST Rate:</span>
                <span className="text-[#252733]">{product.taxRate}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Last Updated:</span>
                <span className="text-slate-400">{formatDate(product.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Product Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        title={`Edit Product: ${product.sku}`}
        description="Update specifications, price, internal cost, and stock."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 font-sans text-xs">
          {isLossMaking && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Selling price cannot be less than or equal to internal cost.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Product Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">SKU</label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="font-mono"
                required
              />
              {errors.sku && <p className="text-[11px] text-rose-600 mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Selling Price (INR)</label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Cost Price (INR)</label>
              <Input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="font-mono"
                required
              />
              {errors.costPrice && <p className="text-[11px] text-rose-600 mt-1">{errors.costPrice}</p>}
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Available Stock (Units)</label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-20 rounded-xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#252733]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLossMaking}
              isLoading={updateMutation.isPending}
              className="bg-[#714b67] text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
