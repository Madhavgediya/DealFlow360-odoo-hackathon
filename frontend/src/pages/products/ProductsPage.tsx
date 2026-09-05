import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, CreateProductPayload } from '../../services/api/products.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Product, ProductType } from '../../types/product';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Plus,
  PackagePlus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Boxes,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export function ProductsPage() {
  const { currency, user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Form State
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('cat-hardware');
  const [type, setType] = React.useState<ProductType>('PHYSICAL');
  const [basePrice, setBasePrice] = React.useState<number>(50000);
  const [costPrice, setCostPrice] = React.useState<number>(35000);
  const [stock, setStock] = React.useState<number>(100);
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => productsApi.getProducts(undefined, selectedCategory === 'ALL' ? undefined : selectedCategory),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const canViewCost = can(user, 'cost.view');
  const canEditProduct = can(user, 'product.edit');

  // Real-time margin calculation for form
  const calculatedMarginAmount = basePrice - costPrice;
  const calculatedMarginPct = basePrice > 0 ? (calculatedMarginAmount / basePrice) * 100 : 0;
  const isLossMaking = basePrice > 0 && costPrice >= basePrice;
  const isBelowHurdle = basePrice > 0 && calculatedMarginPct < 18.0 && !isLossMaking;

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.createProduct(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(res.message || 'Product created successfully!');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) =>
      productsApi.updateProduct(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(res.message || 'Product updated successfully!');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product removed from catalog');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete product');
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategoryId('cat-hardware');
    setType('PHYSICAL');
    setBasePrice(50000);
    setCostPrice(35000);
    setStock(100);
    setDescription('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.categoryId);
    setType(p.type);
    setBasePrice(p.basePrice);
    setCostPrice(p.costPrice);
    setStock(p.totalStockAvailable || 0);
    setDescription(p.description || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setErrors({});
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) {
      errs.name = 'Product name must be at least 3 characters long.';
    }
    if (!sku.trim() || sku.trim().length < 3) {
      errs.sku = 'SKU code is required (min 3 characters).';
    }
    if (basePrice <= 0) {
      errs.basePrice = 'Selling price must be greater than 0.';
    }
    if (costPrice <= 0) {
      errs.costPrice = 'Internal cost price must be greater than 0.';
    }
    if (costPrice >= basePrice) {
      errs.costPrice = 'Internal cost cannot exceed selling price (negative margin).';
    }
    if (stock < 0) {
      errs.stock = 'Available stock cannot be negative.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the validation errors before saving.');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        payload: {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          categoryId,
          type,
          basePrice,
          costPrice,
          totalStockAvailable: stock,
          description: description.trim(),
        },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        categoryId,
        type,
        basePrice,
        costPrice,
        stock,
        description: description.trim(),
      });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product Name / SKU',
      sortable: true,
      cell: (p) => (
        <div className="flex items-center gap-3">
          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          )}
          <div>
            <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors">
              {p.name}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{p.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Category',
      sortable: true,
      cell: (p) => <Badge variant="secondary">{p.categoryName}</Badge>,
    },
    {
      key: 'basePrice',
      header: 'Selling Price (List)',
      sortable: true,
      cell: (p) => (
        <span className="font-bold text-[#252733] font-mono">
          {formatCurrency(p.basePrice, currency)}
        </span>
      ),
    },
    {
      key: 'costPrice',
      header: 'Cost (Internal)',
      cell: (p) =>
        canViewCost ? (
          <span className="text-slate-500 font-mono">
            {formatCurrency(p.costPrice, currency)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
            <Lock className="w-3 h-3 text-slate-400" /> Hidden
          </span>
        ),
    },
    {
      key: 'margin',
      header: 'Standard Margin',
      cell: (p) => {
        if (!canViewCost) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
              <Lock className="w-3 h-3 text-slate-400" /> Hidden
            </span>
          );
        }
        const marginPct = ((p.basePrice - p.costPrice) / p.basePrice) * 100;
        return (
          <span
            className={`font-bold font-mono ${
              marginPct < 18 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {marginPct.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'totalStockAvailable',
      header: 'Stock Status',
      sortable: true,
      cell: (p) => {
        if (p.type === 'SUBSCRIPTION') {
          return <Badge variant="secondary">Cloud SaaS</Badge>;
        }
        const qty = p.totalStockAvailable || 0;
        if (qty === 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (qty < 20) {
          return (
            <Badge variant="warning">
              Low: {qty} Units
            </Badge>
          );
        }
        return (
          <span className="font-medium text-[#252733] font-mono">
            {qty} Units
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canEditProduct && (
            <button
              onClick={() => openEditModal(p)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#714b67] hover:bg-slate-100 transition-colors"
              title="Edit Product"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {can(user, 'quote.delete') && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove ${p.name}?`)) {
                  deleteMutation.mutate(p.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Products & Catalog' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Product Catalog & Category Rules
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard pricing floor, cost margins, SKU validation, and inventory governance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!canViewCost && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Lock className="w-3 h-3" /> Cost/Margins masked for {user?.roleTitle}
              </Badge>
            )}
            {canEditProduct && (
              <Button
                onClick={openCreateModal}
                className="gap-2 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
            selectedCategory === 'ALL'
              ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-subtle'
              : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]'
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-subtle'
                : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]'
            }`}
          >
            {cat.name} (Max Disc: {cat.maxDiscountLimit}%)
          </button>
        ))}
      </div>

      {/* Product Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchPlaceholder="Search products by SKU, name, or description..."
        onRowClick={(p) => navigate(`/products/${p.id}`)}
      />

      {/* Add / Edit Product Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={closeModal}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <PackagePlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">
              {editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Add Catalog Product / Service'}
            </span>
          </div>
        }
        description="Configure product SKU, pricing hierarchy, internal cost margins, and initial stock."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 font-sans text-xs">
          {/* Validation alerts */}
          {isLossMaking && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Negative Profit Margin Violation</span>
                <span>Selling price cannot be less than or equal to internal cost price. Loss-making items are blocked by deal desk policy.</span>
              </div>
            </div>
          )}

          {isBelowHurdle && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Standard margin ({calculatedMarginPct.toFixed(1)}%) is below the recommended 18.0% company hurdle floor.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Enterprise GPU Rack Server"
                className={errors.name ? 'border-rose-500' : ''}
                required
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                SKU / Catalog Code <span className="text-rose-500">*</span>
              </label>
              <Input
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value.toUpperCase());
                  if (errors.sku) setErrors({ ...errors, sku: '' });
                }}
                placeholder="e.g. SKU-GPU-9900"
                className={`font-mono ${errors.sku ? 'border-rose-500' : ''}`}
                required
              />
              {errors.sku && <p className="text-[11px] text-rose-600 mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="cat-hardware">Enterprise Hardware</option>
                <option value="cat-saas">Enterprise Software & SaaS</option>
                <option value="cat-services">Professional Services & SLA</option>
                <option value="cat-consulting">Commercial Consulting</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Product Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="PHYSICAL">Physical Hardware</option>
                <option value="SUBSCRIPTION">SaaS Subscription</option>
                <option value="SERVICE">Professional Service</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Available Stock (Units)</label>
              <Input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => {
                  setStock(Number(e.target.value));
                  if (errors.stock) setErrors({ ...errors, stock: '' });
                }}
                className={`font-mono ${errors.stock ? 'border-rose-500' : ''}`}
              />
              {errors.stock && <p className="text-[11px] text-rose-600 mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                List Selling Price (INR) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={basePrice}
                onChange={(e) => {
                  setBasePrice(Number(e.target.value));
                  if (errors.basePrice) setErrors({ ...errors, basePrice: '' });
                }}
                className={`font-mono font-bold ${errors.basePrice ? 'border-rose-500' : ''}`}
              />
              {errors.basePrice && <p className="text-[11px] text-rose-600 mt-1">{errors.basePrice}</p>}
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Internal Cost Price (INR) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={costPrice}
                onChange={(e) => {
                  setCostPrice(Number(e.target.value));
                  if (errors.costPrice) setErrors({ ...errors, costPrice: '' });
                }}
                className={`font-mono ${errors.costPrice ? 'border-rose-500' : ''}`}
              />
              {errors.costPrice && <p className="text-[11px] text-rose-600 mt-1">{errors.costPrice}</p>}
            </div>
          </div>

          {/* Real-time Profitability Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 font-sans">Profitability Preview:</span>
            <div className="flex items-center gap-4">
              <span>Gross Profit: <strong>{formatCurrency(calculatedMarginAmount, currency)}</strong></span>
              <span className={`font-bold ${calculatedMarginPct < 18 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Margin: {calculatedMarginPct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Product Description / Specifications</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specs, performance details, and compatibility..."
              className="w-full h-20 rounded-xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLossMaking}
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
