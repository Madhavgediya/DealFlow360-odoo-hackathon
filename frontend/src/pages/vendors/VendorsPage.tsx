import { useQuery } from '@tanstack/react-query';
import { vendorsApi } from '../../services/api/vendors.api';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Vendor } from '../../types/vendor';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Building2, Star, Clock, ShieldCheck, ArrowRight, ShoppingCart } from 'lucide-react';

export function VendorsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getVendors(),
  });

  const vendors = data?.data || [];

  const columns: ColumnDef<Vendor>[] = [
    {
      key: 'name',
      header: 'Vendor Name / Code',
      sortable: true,
      cell: (v) => (
        <div>
          <div className="font-semibold text-[#252733] group-hover:text-[#714b67] transition-colors">
            {v.name}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{v.code}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Component Category',
      sortable: true,
      cell: (v) => <Badge variant="secondary">{v.category}</Badge>,
    },
    {
      key: 'overallScore',
      header: 'Reliability Index',
      sortable: true,
      cell: (v) => (
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-[#714b67] text-sm">{v.overallScore}/100</span>
          <span className="text-slate-400 text-[10px]">({v.rating} ★)</span>
        </div>
      ),
    },
    {
      key: 'leadTimeAvgDays',
      header: 'Avg Lead Time',
      sortable: true,
      cell: (v) => (
        <span className="font-mono text-slate-700 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#714b67]" />
          {v.leadTimeAvgDays} Days
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Partner Status',
      sortable: true,
      cell: (v) => (
        <Badge variant={v.status === 'PREFERRED' ? 'indigo' : 'default'}>
          {v.status}
        </Badge>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      cell: (v) => <span className="font-mono text-xs text-slate-600">{v.paymentTerms}</span>,
    },
    {
      key: 'activePoCount',
      header: 'Active POs',
      cell: (v) => <span className="font-mono text-slate-700">{v.activePoCount} Orders</span>,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Vendors' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Vendor Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage suppliers, scorecards, lead times, and reliability metrics
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/vendors/compare/prod-1')}
          className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
        >
          <Building2 className="w-4 h-4" />
          Vendor Comparison Matrix
        </Button>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={vendors}
          isLoading={isLoading}
          searchPlaceholder="Search vendors by name, code, or category..."
          onRowClick={() => navigate(`/vendors/compare/prod-1`)}
        />
      </div>
    </div>
  );
}
