import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function PortalProductsPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = React.useState<Record<string, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });

  const products = data?.data || [];

  const handleToggleSelect = (prodId: string) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[prodId]) delete copy[prodId];
      else copy[prodId] = 10;
      return copy;
    });
  };

  const handleRequestQuote = () => {
    toast.success('Custom quotation requested! Generating proposal...');
    navigate('/portal/quotes/q-1024');
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
            Enterprise Hardware & Software Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Select items to request a custom volume discount proposal from our commercial sales team.
          </p>
        </div>

        {selectedCount > 0 && (
          <Button
            onClick={handleRequestQuote}
            className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white rounded-xl"
          >
            <ShoppingCart className="w-4 h-4" />
            Request Quotation ({selectedCount} Selected)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => {
          const isSelected = !!selectedItems[p.id];
          return (
            <Card
              key={p.id}
              className={`border bg-white transition-all flex flex-col justify-between shadow-sm rounded-2xl overflow-hidden ${
                isSelected ? 'border-[#714b67] ring-2 ring-[#714b67]/10 shadow-md' : 'border-[#eceef5]'
              }`}
            >
              <div>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-44 object-cover border-b border-[#eceef5]"
                  />
                )}
                <CardHeader className="p-5 space-y-1.5">
                  <Badge variant="indigo" size="sm" className="w-fit">{p.categoryName}</Badge>
                  <CardTitle className="text-sm font-bold text-[#252733] leading-snug font-display">{p.name}</CardTitle>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-sans">{p.description}</p>
                </CardHeader>
              </div>

              <CardContent className="p-5 pt-0 space-y-3">
                <div className="flex items-baseline justify-between font-mono pt-3 border-t border-[#eceef5]">
                  <span className="text-xs text-slate-500 font-sans">Enterprise List:</span>
                  <span className="text-base font-bold text-[#252733]">{formatCurrency(p.basePrice, currency)}</span>
                </div>

                <Button
                  variant={isSelected ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleSelect(p.id)}
                  className={`w-full gap-1.5 text-xs rounded-xl ${
                    isSelected ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#714b67]" />
                      <span>Item Selected</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-3.5 h-3.5" />
                      <span>Select for Quotation</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
