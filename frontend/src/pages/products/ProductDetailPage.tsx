import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { vendorsApi } from '../../services/api/vendors.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Product, ProductType } from '../../types/product';
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
  Trash2,
  CheckCircle2,
  Boxes,
  Layers,
  ArrowRight,
  AlertCircle,
  Building2,
  Clock,
  ExternalLink,
  Wrench,
  Cloud,
  Cpu,
  Archive,
  Upload,
  Image,
  Camera,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, user } = useAuthStore();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Form Fields
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [type, setType] = React.useState<ProductType>('PHYSICAL');
  const [basePrice, setBasePrice] = React.useState<number>(0);
  const [costPrice, setCostPrice] = React.useState<number>(0);
  const [stock, setStock] = React.useState<number>(0);
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
      if (id) {
        updateMutation.mutate({ imageUrl: result });
      }
      toast.success('Product photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id || 'prod-1'),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getVendors(),
  });

  const product = data?.data;
  const categories = categoriesData?.data || [];
  const vendors = vendorsData?.data || [];

  const canViewCost = can(user, 'cost.view');
  const canEdit = can(user, 'product.edit');

  React.useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategoryId(product.categoryId);
      setType(product.type);
      setBasePrice(product.basePrice);
      setCostPrice(product.costPrice);
      setStock(product.totalStockAvailable || 0);
      setUnit(product.unit || 'Units');
      setPreferredVendorId(product.preferredVendorId || '');
      setServiceProviderName(product.serviceProviderName || '');
      setServiceSla(product.serviceSla || 'Next Business Day');
      setImageUrl(product.imageUrl || '');
      setActive(product.active !== undefined ? product.active : true);
      setDescription(product.description || '');
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Product>) =>
      productsApi.updateProduct(id || 'prod-1', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(res.message || 'Product specifications updated successfully!');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.deleteProduct(id || 'prod-1'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product permanently removed from catalog');
      navigate('/products');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete product');
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

  // Find linked vendor
  const linkedVendor = vendors.find(
    (v) => v.id === product.preferredVendorId || v.name.toLowerCase() === (product.serviceProviderName || '').toLowerCase()
  );

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

    const selectedCategoryObj = categories.find((c) => c.id === categoryId);

    updateMutation.mutate({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      categoryId,
      categoryName: selectedCategoryObj?.name || product.categoryName,
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
    });
  };

  return (
    <div className="space-y-6 font-sans">
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
            {product.type === 'SERVICE' ? (
              <Badge variant="warning" className="gap-1">
                <Wrench className="w-3 h-3" /> Professional Service / SLA
              </Badge>
            ) : product.type === 'SUBSCRIPTION' ? (
              <Badge variant="indigo" className="gap-1">
                <Cloud className="w-3 h-3" /> SaaS Cloud Subscription
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <Cpu className="w-3 h-3" /> Physical Hardware
              </Badge>
            )}
            {!product.active && (
              <Badge variant="destructive">Archived</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Catalog SKU: {product.sku} • Billing Unit: {product.unit || 'Units'}
          </p>
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

          {can(user, 'quote.delete') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-1.5 font-sans"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
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
                Commercial Governance & Product Specifications
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
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">per {product.unit || 'Unit'}</span>
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
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Floor Procurement Cost</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Standard Margin</span>
                  {canViewCost ? (
                    <span className={`text-base font-bold ${marginPct < 18 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {marginPct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1 pt-1 font-sans">
                      <Lock className="w-3 h-3 text-slate-400" /> Masked
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    {marginPct >= 18 ? 'Above 18% Hurdle Floor' : 'Requires Approval Desk'}
                  </span>
                </div>
              </div>

              {/* Stock availability banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#714b67]">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#252733] block">
                      {product.type === 'SERVICE' ? 'Service Delivery Capacity' : 'Warehouse Stock Allocation'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {product.type === 'SERVICE'
                        ? 'Monthly SLA field dispatch capacity'
                        : 'Surat Central Logistics & Distribution Hub'}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-base font-bold text-[#252733]">
                    {product.totalStockAvailable || 0} {product.unit || 'Units'}
                  </span>
                  <span className="text-[11px] text-emerald-600 block">Available Immediate</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Provider & Fulfillment Partner Card */}
          <Card className="border-[#ecdfe8] bg-[#fbf9fa] shadow-subtle rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-[#ecdfe8]">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-[#714b67] font-display">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#714b67]" />
                  Service Provider & Fulfillment Partner
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/vendors')}
                  className="h-7 text-xs gap-1 border-[#ecdfe8] text-[#714b67] bg-white hover:bg-[#f5eff3]"
                >
                  <ExternalLink className="w-3 h-3" />
                  Vendor Directory
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white border border-[#ecdfe8]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Provider</span>
                  <span className="text-sm font-bold text-[#252733] mt-0.5 block">
                    {product.serviceProviderName || linkedVendor?.name || 'In-House Operations & Field Engineering'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {linkedVendor ? `${linkedVendor.category} • ${linkedVendor.rating}★ Rating` : 'Internal Company Delivery'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#ecdfe8]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Level Agreement</span>
                  <span className="text-sm font-bold text-[#714b67] mt-0.5 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {product.serviceSla || 'Standard Next Business Day Onsite'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {linkedVendor ? `Lead time: ~${linkedVendor.leadTimeAvgDays} business days` : 'Turnaround SLA'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  When this item is quoted and converted to a Sales Order, the fulfillment engine can automatically dispatch a Work Order or Purchase Order directly to the assigned partner.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Catalog Metadata & Actions */}
        <div className="space-y-6">
          {/* Photo & Visual Asset Card */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-[#e5e7eb] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#252733] font-display flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#714b67]" />
                Product Visual Asset
              </CardTitle>
              {canEdit && product.imageUrl && (
                <button
                  type="button"
                  onClick={() => updateMutation.mutate({ imageUrl: '' })}
                  className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="relative w-full h-44 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center group shadow-xs">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <Image className="w-8 h-8 mb-1 text-slate-300" />
                    <span className="text-xs font-mono">No Image Uploaded</span>
                  </div>
                )}
              </div>

              {canEdit && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2 text-xs border-slate-200 hover:bg-slate-50 text-[#252733]"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#714b67]" />
                    <span>Upload / Change Product Photo</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-[#e5e7eb]">
              <CardTitle className="text-sm font-bold text-[#252733] font-display">
                Catalog Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Product ID:</span>
                <span className="text-slate-700 font-bold">{product.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">SKU / Code:</span>
                <span className="text-[#714b67] font-bold">{product.sku}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Type:</span>
                <span className="text-slate-700 font-sans font-medium">{product.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Category:</span>
                <span className="text-slate-700 font-sans">{product.categoryName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Tax Rate:</span>
                <span className="text-slate-700">{product.taxRate || 18}% GST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Active Status:</span>
                <span className={product.active ? 'text-emerald-600 font-bold' : 'text-slate-400 font-bold'}>
                  {product.active ? 'Active' : 'Archived'}
                </span>
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
        description="Update specifications, price, internal cost, partner affiliations, and stock."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 font-sans text-xs">
          {isLossMaking && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Selling price cannot be less than or equal to internal cost.</span>
            </div>
          )}

          {/* Photo Upload in Edit Modal */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-5 h-5 text-slate-300" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">Product Image URL</span>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[10px] text-rose-500 hover:text-rose-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Input
                type="text"
                placeholder="Image URL or upload file..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-[11px] h-7 bg-white"
              />
            </div>
          </div>

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
              <label className="text-slate-600 font-semibold block mb-1">Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="PHYSICAL">Physical Hardware</option>
                <option value="SERVICE">Professional Service / SLA</option>
                <option value="SUBSCRIPTION">SaaS Subscription</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Unit</label>
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

          {/* Service Provider & SLA in Edit Modal */}
          <div className="p-3 bg-[#fbf9fa] rounded-xl border border-[#ecdfe8] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Service Provider / Vendor
              </label>
              <select
                value={preferredVendorId}
                onChange={(e) => handleVendorSelect(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="">-- Internal Company Operations --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
              <div className="mt-1">
                <Input
                  value={serviceProviderName}
                  onChange={(e) => setServiceProviderName(e.target.value)}
                  placeholder="Custom service partner name"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Service SLA</label>
              <select
                value={serviceSla}
                onChange={(e) => setServiceSla(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="Next Business Day">Next Business Day (Standard)</option>
                <option value="4-Hour Critical Response">4-Hour Critical Response</option>
                <option value="2-Hour Emergency Onsite">2-Hour Emergency Onsite</option>
                <option value="99.9% Uptime Guarantee">99.9% Uptime Guarantee</option>
                <option value="Custom SLA">Custom SLA</option>
              </select>
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
              <label className="text-slate-600 font-semibold block mb-1">Available Stock / Capacity</label>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="detailActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-300 text-[#714b67] focus:ring-[#714b67]"
            />
            <label htmlFor="detailActive" className="text-xs text-slate-700 font-medium">
              Product is active and available in catalog
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLossMaking || updateMutation.isPending}
              className="bg-[#714b67] text-white hover:bg-[#5e3c54]"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <span>Confirm Product Removal</span>
          </div>
        }
        description={`Are you sure you want to permanently delete "${product.name}" (${product.sku})? This cannot be undone.`}
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Delete Product'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
