import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, CreateProductPayload } from '../../services/api/products.api';
import { vendorsApi } from '../../services/api/vendors.api';
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
  Building2,
  Clock,
  Sparkles,
  Archive,
  RefreshCw,
  ExternalLink,
  Wrench,
  Cloud,
  Cpu,
  Upload,
  Image,
  Camera,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export function ProductsPage() {
  const { currency, user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedType, setSelectedType] = React.useState<string>('ALL');
  const [showArchived, setShowArchived] = React.useState<boolean>(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

  // Form State
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('cat-hardware');
  const [type, setType] = React.useState<ProductType>('PHYSICAL');
  const [basePrice, setBasePrice] = React.useState<number>(50000);
  const [costPrice, setCostPrice] = React.useState<number>(35000);
  const [stock, setStock] = React.useState<number>(100);
  const [unit, setUnit] = React.useState('Units');
  const [preferredVendorId, setPreferredVendorId] = React.useState('');
  const [serviceProviderName, setServiceProviderName] = React.useState('');
  const [serviceSla, setServiceSla] = React.useState('Next Business Day');
  const [imageUrl, setImageUrl] = React.useState('');
  const [active, setActive] = React.useState(true);
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image file must be under 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      toast.success('Product photo loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Data Queries
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => productsApi.getProducts(undefined, selectedCategory === 'ALL' ? undefined : selectedCategory),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getVendors(),
  });

  const allProducts = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const vendors = vendorsData?.data || [];
  const canViewCost = can(user, 'cost.view');
  const canEditProduct = can(user, 'product.edit');

  // Filtered Products
  const products = React.useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedType !== 'ALL' && p.type !== selectedType) return false;
      if (!showArchived && !p.active) return false;
      return true;
    });
  }, [allProducts, selectedType, showArchived]);

  // Real-time margin calculation for form
  const calculatedMarginAmount = basePrice - costPrice;
  const calculatedMarginPct = basePrice > 0 ? (calculatedMarginAmount / basePrice) * 100 : 0;
  const isLossMaking = basePrice > 0 && costPrice >= basePrice;
  const isBelowHurdle = basePrice > 0 && calculatedMarginPct < 18.0 && !isLossMaking;

  // Mutations
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
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete product');
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategoryId(categories[0]?.id || 'cat-hardware');
    setType('PHYSICAL');
    setBasePrice(50000);
    setCostPrice(35000);
    setStock(100);
    setUnit('Units');
    setPreferredVendorId('');
    setServiceProviderName('');
    setServiceSla('Next Business Day');
    setImageUrl('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400');
    setActive(true);
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
    setStock(p.totalStockAvailable !== undefined ? p.totalStockAvailable : 100);
    setUnit(p.unit || 'Units');
    setPreferredVendorId(p.preferredVendorId || '');
    setServiceProviderName(p.serviceProviderName || '');
    setServiceSla(p.serviceSla || 'Next Business Day');
    setImageUrl(p.imageUrl || '');
    setActive(p.active !== undefined ? p.active : true);
    setDescription(p.description || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setErrors({});
  };

  const handleVendorSelect = (vendorId: string) => {
    setPreferredVendorId(vendorId);
    if (!vendorId) {
      setServiceProviderName('');
    } else {
      const v = vendors.find((vend) => vend.id === vendorId);
      if (v) {
        setServiceProviderName(v.name);
      }
    }
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
      errs.stock = 'Available stock/capacity cannot be negative.';
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

    const selectedCategoryObj = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategoryObj?.name || 'General';

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        payload: {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          categoryId,
          categoryName,
          type,
          basePrice,
          costPrice,
          totalStockAvailable: stock,
          unit,
          preferredVendorId: preferredVendorId || undefined,
          serviceProviderName: serviceProviderName.trim() || undefined,
          serviceSla: serviceSla.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          active,
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
        unit,
        preferredVendorId: preferredVendorId || undefined,
        serviceProviderName: serviceProviderName.trim() || undefined,
        serviceSla: serviceSla.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        active,
        description: description.trim(),
      });
    }
  };

  const toggleProductActive = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !p.active;
    updateMutation.mutate({
      id: p.id,
      payload: { active: newStatus },
    });
    toast.success(newStatus ? `Activated ${p.sku}` : `Archived ${p.sku}`);
  };

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product Name / SKU',
      sortable: true,
      cell: (p) => {
        const typeIcon =
          p.type === 'SERVICE' ? (
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
          ) : p.type === 'SUBSCRIPTION' ? (
            <Cloud className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-slate-600" />
          );

        return (
          <div className="flex items-center gap-3">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                {typeIcon}
              </div>
            )}
            <div>
              <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors flex items-center gap-1.5">
                {p.name}
                {!p.active && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                    Archived
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>{p.sku}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-sans font-medium text-slate-500">
                  {p.type === 'SERVICE' ? 'Service' : p.type === 'SUBSCRIPTION' ? 'Subscription' : 'Physical'}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'categoryName',
      header: 'Category',
      sortable: true,
      cell: (p) => <Badge variant="secondary">{p.categoryName}</Badge>,
    },
    {
      key: 'serviceProvider',
      header: 'Service Provider / Partner',
      sortable: true,
      cell: (p) => {
        const providerName =
          p.serviceProviderName ||
          (p.preferredVendorId ? vendors.find((v) => v.id === p.preferredVendorId)?.name : null);

        if (p.type === 'SERVICE' || providerName) {
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#714b67]">
                <Building2 className="w-3.5 h-3.5 text-[#714b67] shrink-0" />
                <span>{providerName || 'External Service Partner'}</span>
              </div>
              {p.serviceSla && (
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{p.serviceSla}</span>
                </div>
              )}
            </div>
          );
        }

        return (
          <span className="text-[11px] text-slate-400 font-mono">
            Internal Operations
          </span>
        );
      },
    },
    {
      key: 'basePrice',
      header: 'Selling Price (List)',
      sortable: true,
      cell: (p) => (
        <div>
          <span className="font-bold text-[#252733] font-mono block">
            {formatCurrency(p.basePrice, currency)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            per {p.unit || 'Unit'}
          </span>
        </div>
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
      header: 'Margin',
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
            className={`font-bold font-mono text-xs ${
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
      header: 'Stock / Capacity',
      sortable: true,
      cell: (p) => {
        if (p.type === 'SUBSCRIPTION') {
          return <Badge variant="secondary">SaaS License</Badge>;
        }
        if (p.type === 'SERVICE') {
          return (
            <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {p.totalStockAvailable || 50} Slots/Mo
            </span>
          );
        }
        const qty = p.totalStockAvailable || 0;
        if (qty === 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (qty < 20) {
          return <Badge variant="warning">Low: {qty} {p.unit || 'Units'}</Badge>;
        }
        return (
          <span className="font-medium text-[#252733] font-mono text-xs">
            {qty} {p.unit || 'Units'}
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#714b67] hover:bg-[#f5eff3] transition-colors"
              title="Edit Product"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canEditProduct && (
            <button
              onClick={(e) => toggleProductActive(p, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={p.active ? 'Archive Product' : 'Restore Product'}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
          {can(user, 'quote.delete') && (
            <button
              onClick={() => {
                setProductToDelete(p);
                setIsDeleteModalOpen(true);
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
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Products & Catalog' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Product Catalog & Service Portfolio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive SKU management with multi-tier pricing, profit margin floors, external service provider SLAs, and warehouse inventory.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!canViewCost && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Lock className="w-3 h-3" /> Cost & Margins Masked
              </Badge>
            )}
            {canEditProduct && (
              <Button
                onClick={openCreateModal}
                className="gap-2 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Add Product / Service
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e5e7eb] shadow-subtle">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
              selectedCategory === 'ALL'
                ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-xs'
                : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            All Categories ({allProducts.length})
          </button>
          {categories.map((cat) => {
            const count = allProducts.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-xs'
                    : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Type & Archived Toggles */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                selectedType === 'ALL' ? 'bg-white text-[#714b67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('PHYSICAL')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                selectedType === 'PHYSICAL' ? 'bg-white text-[#714b67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Physical
            </button>
            <button
              onClick={() => setSelectedType('SERVICE')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                selectedType === 'SERVICE' ? 'bg-white text-[#714b67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setSelectedType('SUBSCRIPTION')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                selectedType === 'SUBSCRIPTION' ? 'bg-white text-[#714b67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SaaS
            </button>
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
              showArchived
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showArchived ? 'Archived Visible' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Product Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchPlaceholder="Search catalog by SKU, product name, service provider, or description..."
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
        description="Configure product SKU, service partner affiliation, SLA commitments, internal pricing floors, and stock capacity."
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

          {/* Photo Upload & Preview Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#714b67]" />
                <span>Product Photo / Visual Asset</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                >
                  <X className="w-3 h-3" /> Clear Photo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              {/* Image Preview Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs group">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-1.5 text-center">
                    <Image className="w-5 h-5 mb-0.5 text-slate-300" />
                    <span className="text-[9px] font-mono leading-none">No Photo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs bg-white border-slate-200 hover:bg-slate-100 text-[#252733] h-8"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#714b67]" />
                    <span>Upload Image File</span>
                  </Button>
                  <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, WebP up to 8MB</span>
                </div>

                <Input
                  type="text"
                  placeholder="Or paste external image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-[11px] h-7 bg-white"
                />

                {/* Preset Quick Image Options */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-[#714b67] hover:text-[#714b67] transition-colors"
                  >
                    Server 4U
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-[#714b67] hover:text-[#714b67] transition-colors"
                  >
                    100G Switch
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-[#714b67] hover:text-[#714b67] transition-colors"
                  >
                    24/7 SLA Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-[#714b67] hover:text-[#714b67] transition-colors"
                  >
                    SaaS License
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Name and SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Product / Service Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Enterprise GPU Rack Server or 24/7 AMC SLA"
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

          {/* Category, Type, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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
                <option value="SERVICE">Professional Service / SLA</option>
                <option value="SUBSCRIPTION">SaaS Cloud Subscription</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Billing Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="Units">Units</option>
                <option value="Hours">Hours</option>
                <option value="Months">Months</option>
                <option value="Years">Years</option>
                <option value="Licenses">Licenses</option>
                <option value="Engagements">Engagements</option>
              </select>
            </div>
          </div>

          {/* Service Provider & SLA Fields */}
          <div className="p-3.5 bg-[#fbf9fa] rounded-xl border border-[#ecdfe8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#714b67] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Service Provider & SLA Fulfillment
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {type === 'SERVICE' ? 'Recommended for Services' : 'Optional for Physical/SaaS'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  Designated Service Provider / Vendor
                </label>
                <select
                  value={preferredVendorId}
                  onChange={(e) => handleVendorSelect(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
                >
                  <option value="">-- Internal / Company Delivered --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category} • {v.rating}★)
                    </option>
                  ))}
                </select>
                <div className="mt-1.5">
                  <Input
                    value={serviceProviderName}
                    onChange={(e) => setServiceProviderName(e.target.value)}
                    placeholder="Or enter custom service partner name"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  Service Level Agreement (SLA)
                </label>
                <select
                  value={serviceSla}
                  onChange={(e) => setServiceSla(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
                >
                  <option value="Next Business Day">Next Business Day (Standard)</option>
                  <option value="4-Hour Critical Response">4-Hour Critical Response (24/7)</option>
                  <option value="2-Hour Emergency Onsite">2-Hour Emergency Onsite</option>
                  <option value="99.9% Uptime Guarantee">99.9% Uptime Guarantee</option>
                  <option value="Dedicated Technical Account Manager">Dedicated TAM Support</option>
                  <option value="Custom SLA">Custom SLA Term</option>
                </select>
                {serviceSla === 'Custom SLA' && (
                  <div className="mt-1.5">
                    <Input
                      placeholder="Specify custom SLA terms..."
                      className="h-8 text-xs"
                      onChange={(e) => setServiceSla(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                required
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
                required
              />
              {errors.costPrice && <p className="text-[11px] text-rose-600 mt-1">{errors.costPrice}</p>}
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                {type === 'SERVICE' ? 'Monthly Service Capacity' : 'Available Stock Units'}
              </label>
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

          {/* Margin Preview Bar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Calculated Profit Margin</span>
              <span className={calculatedMarginPct < 18 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {calculatedMarginPct.toFixed(1)}% (Profit: {formatCurrency(calculatedMarginAmount, currency)})
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  calculatedMarginPct <= 0
                    ? 'bg-rose-500 w-0'
                    : calculatedMarginPct < 18
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(Math.max(calculatedMarginPct, 0), 100)}%` }}
              />
            </div>
          </div>

          {/* Description & Active toggle */}
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description & Specifications</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, SLA coverage, hardware specs, or technical support notes..."
              className="w-full rounded-xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="productActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-300 text-[#714b67] focus:ring-[#714b67]"
            />
            <label htmlFor="productActive" className="text-xs text-slate-700 font-medium">
              Product is Active & visible for quotation building
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending || updateMutation.isPending || isLossMaking}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingProduct
                ? 'Save Product Changes'
                : 'Create Catalog Product'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <span>Confirm Product Removal</span>
          </div>
        }
        description="Are you sure you want to remove this item from the product catalog? This action will permanently remove it from quotations and inventory tracking."
      >
        {productToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">{productToDelete.name}</div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">SKU: {productToDelete.sku}</div>
              <div className="text-xs text-[#714b67] font-semibold mt-1">
                List Price: {formatCurrency(productToDelete.basePrice, currency)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(productToDelete.id)}
              >
                {deleteMutation.isPending ? 'Removing...' : 'Permanently Delete Product'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
