import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Store,
  Plus,
  Package,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function RetailerCatalogPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('ALL');

  const retailerDetails = user?.retailerDetails || {
    tier: 'PLATINUM',
    discountRate: 18.5,
  };

  const catalogItems = [
    {
      id: 'prod-1',
      name: 'EdgeX Core Enterprise Switch 48G',
      sku: 'EDG-SW-48G',
      category: 'Networking',
      mrp: 25000,
      dealerPrice: 20375,
      moq: 10,
      stock: 240,
      warranty: '3 Years Enterprise Support',
      desc: 'Layer 3 Managed Gigabit Switch with 4x 10G SFP+ Uplinks, PoE+ 740W budget.',
    },
    {
      id: 'prod-2',
      name: 'SensorHub Multi-Sensor IoT Gateway',
      sku: 'IOT-GW-900',
      category: 'IoT & Sensors',
      mrp: 8000,
      dealerPrice: 6520,
      moq: 25,
      stock: 450,
      warranty: '2 Years Manufacturer Warranty',
      desc: 'Industrial Grade IoT Gateway with LoRaWAN, BLE, Zigbee & Cellular fallback.',
    },
    {
      id: 'prod-3',
      name: 'PowerPro Smart Rackmount PDU 32A',
      sku: 'PDU-RK-32A',
      category: 'Power Infrastructure',
      mrp: 18000,
      dealerPrice: 14670,
      moq: 5,
      stock: 120,
      warranty: '5 Years Replacement Warranty',
      desc: 'Monitored & Switched zero-U PDU with remote outlet power cycling & metering.',
    },
    {
      id: 'prod-4',
      name: 'RackMaster 42U Heavy-Duty Server Enclosure',
      sku: 'RCK-42U-HD',
      category: 'Enclosures',
      mrp: 55000,
      dealerPrice: 44825,
      moq: 2,
      stock: 65,
      warranty: '10 Years Structural Warranty',
      desc: 'Sound-dampened server cabinet with ventilated mesh doors and integrated cable management.',
    },
    {
      id: 'prod-5',
      name: 'OptiCore 10G SFP+ Optical Transceiver (10km)',
      sku: 'OPT-10G-LR',
      category: 'Networking',
      mrp: 3500,
      dealerPrice: 2850,
      moq: 50,
      stock: 800,
      warranty: 'Lifetime Replacement',
      desc: '1310nm Single-Mode Fiber LC Transceiver Module, hot-swappable.',
    },
    {
      id: 'prod-6',
      name: 'SmartShield UPS Online Double-Conversion 3kVA',
      sku: 'UPS-3KVA-ONL',
      category: 'Power Infrastructure',
      mrp: 42000,
      dealerPrice: 34230,
      moq: 4,
      stock: 90,
      warranty: '3 Years including Batteries',
      desc: 'True pure sine-wave online UPS with LCD interface & SNMP management card.',
    },
  ];

  const filteredItems = catalogItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              {retailerDetails.tier} VIP Wholesale Pricing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2 mt-1">
            <Store className="w-6 h-6 text-[#714b67]" />
            Wholesale Hardware & Commercial Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time warehouse stock, guaranteed MOQ volume thresholds, and exclusive B2B rates.
          </p>
        </div>

        <Button
          onClick={() => navigate('/retailer/quotes')}
          className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Go to Quote Requests
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search catalog by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Networking', 'IoT & Sensors', 'Power Infrastructure', 'Enclosures'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all whitespace-nowrap text-xs ${
                categoryFilter === cat
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Hardware' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="p-5 border-slate-200/80 bg-white shadow-subtle rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-slate-100 text-slate-700">
                  {item.category}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px]">
                  {item.stock} in Stock
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#252733] text-sm leading-snug">{item.name}</h3>
                <span className="text-[11px] font-mono text-slate-400">SKU: {item.sku}</span>
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{item.desc}</p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">List Retail MRP:</span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{item.mrp.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Dealer Net ({retailerDetails.discountRate}% Off):
                  </span>
                  <span className="text-base font-bold text-[#714b67] font-mono">
                    ₹{item.dealerPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>MOQ: <strong>{item.moq} Units</strong></span>
                <span className="text-emerald-700 font-semibold">{item.warranty}</span>
              </div>

              <Button
                onClick={() => {
                  toast.success(`Added ${item.name} (${item.moq} MOQ) to quote request!`);
                  navigate('/retailer/quotes');
                }}
                className="w-full bg-[#714b67] hover:bg-[#5e3c54] text-white font-semibold text-xs gap-1.5 shadow-sm"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Build Volume Quote
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RetailerCatalogPage;
