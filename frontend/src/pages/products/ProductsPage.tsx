import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Product } from '../../types/product';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function ProductsPage() {
  const { currency, user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

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
        <span className="font-bold text-[#252733]">
          {formatCurrency(p.basePrice, currency)}
        </span>
      ),
    },
    {
      key: 'costPrice',
      header: 'Cost (Internal)',
      cell: (p) =>
        canViewCost ? (
          <span className="text-slate-500">
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
          <span className="font-bold text-emerald-600">
            {marginPct.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'totalStockAvailable',
      header: 'Available Stock',
      sortable: true,
      cell: (p) => (
        <span className="font-medium text-[#252733]">
          {p.type === 'SUBSCRIPTION' ? 'Cloud SaaS' : `${p.totalStockAvailable} Units`}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Products & Catalog' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
            Product Catalog & Category Rules
          </h1>
          <div className="flex items-center gap-2">
            {!canViewCost && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Lock className="w-3 h-3" /> Cost/Margins masked for {user?.roleTitle}
              </Badge>
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
    </div>
  );
}
