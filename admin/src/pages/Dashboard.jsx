import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getAnalytics } from '../api/adminApi';

const periodOptions = ['This Week', 'This Month', 'This Year', 'All Time'];
const periodParamMap = { 'This Week': 'week', 'This Month': 'month', 'This Year': 'year', 'All Time': 'all' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentHostels, setRecentHostels] = useState([]);
  const [recentOwners, setRecentOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Year');
  const navigate = useNavigate();

  const fetchAnalytics = async (period, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setActivityLoading(true);
    try {
      const { data } = await getAnalytics(periodParamMap[period]);
      setStats(data.data.stats);
      setRecentHostels(data.data.recentHostels || []);
      setRecentOwners(data.data.recentOwners || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      if (isInitial) setLoading(false);
      else setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod, true);
  }, []);

  const handlePeriodChange = (opt) => {
    setSelectedPeriod(opt);
    setPeriodOpen(false);
    fetchAnalytics(opt);
  };

  const statCards = [
    {
      label: 'Total Hostels',
      value: stats?.totalHostels ?? '—',
      icon: 'apartment',
      iconColor: 'text-primary bg-primary/10',
      trend: `${stats?.approvedHostels ?? 0} approved`,
      trendLabel: 'currently active',
      trendUp: true,
    },
    {
      label: 'Pending Approval',
      value: (stats?.pendingHostels ?? 0) + (stats?.pendingReviewHostels ?? 0),
      valueColor: 'text-amber-600',
      icon: 'pending_actions',
      iconColor: 'text-amber-500 bg-amber-500/10',
      trend: 'High',
      trendLabel: 'Action required',
      trendIcon: 'priority_high',
      trendColor: 'text-amber-500',
    },
    {
      label: 'Hostel Owners',
      value: stats?.totalOwners ?? '—',
      icon: 'person',
      iconColor: 'text-primary bg-primary/10',
      trend: '',
      trendLabel: '',
      trendUp: true,
    },
  ];

  const total = stats?.totalHostels || 1;
  const approvedPct = Math.round(((stats?.approvedHostels || 0) / total) * 100);
  const pendingPct = Math.round(((stats?.pendingHostels || 0) / total) * 100);
  const rejectedPct = Math.round(((stats?.rejectedHostels || 0) / total) * 100);

  const statusLegend = [
    { color: 'bg-emerald-500', label: 'Approved', value: `${stats?.approvedHostels ?? 0} (${approvedPct}%)` },
    { color: 'bg-amber-500', label: 'Pending', value: `${stats?.pendingHostels ?? 0} (${pendingPct}%)` },
    { color: 'bg-rose-500', label: 'Rejected', value: `${stats?.rejectedHostels ?? 0} (${rejectedPct}%)` },
  ];

  const getStatusIcon = (status) => {
    const map = {
      PENDING: { icon: 'add_business', color: 'text-amber-500' },
      PENDING_REVIEW: { icon: 'rate_review', color: 'text-blue-500' },
      APPROVED: { icon: 'verified', color: 'text-emerald-500' },
      REJECTED: { icon: 'report_problem', color: 'text-rose-500' },
    };
    return map[status] || { icon: 'apartment', color: 'text-primary' };
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400 text-sm">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <span className={`material-symbols-outlined ${card.iconColor} p-1.5 rounded-lg`}>
                {card.icon}
              </span>
            </div>
            <p className={`text-3xl font-bold mt-2 ${card.valueColor || ''}`}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
            {card.trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`${card.trendColor || 'text-emerald-500'} text-xs font-bold flex items-center`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {card.trendIcon || 'trending_up'}
                  </span>{' '}
                  {card.trend}
                </span>
                <span className="text-slate-400 text-[11px]">{card.trendLabel}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-8">
        {/* Hostel Status Breakdown */}
        <div className="col-span-12 lg:col-span-5 bg-white p-5 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Hostel Status Breakdown</h3>
            <div className="relative">
              <button
                onClick={() => setPeriodOpen(!periodOpen)}
                className="text-xs text-slate-500 font-medium flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors"
              >
                {selectedPeriod}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              {periodOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-33">
                  {periodOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handlePeriodChange(opt)}
                      className={`w-full text-left px-4 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        opt === selectedPeriod ? 'text-primary font-bold' : 'text-slate-600 font-medium'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="relative flex justify-center py-6">
            {(() => {
              const r = 80, cx = 100, cy = 100, stroke = 28;
              const circumference = 2 * Math.PI * r;
              const segments = [
                { pct: approvedPct, color: '#10b981' },
                { pct: pendingPct, color: '#f59e0b' },
                { pct: rejectedPct, color: '#f43f5e' },
              ];
              // fill remainder with slate if total < 100
              const usedPct = approvedPct + pendingPct + rejectedPct;
              if (usedPct < 100) segments.push({ pct: 100 - usedPct, color: '#e2e8f0' });
              let offset = 0;
              return (
                <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {segments.map((seg, i) => {
                      const dash = (seg.pct / 100) * circumference;
                      const gap = circumference - dash;
                      const rotate = (offset / 100) * 360 - 90;
                      offset += seg.pct;
                      return (
                        <circle
                          key={i}
                          cx={cx} cy={cy} r={r}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={stroke}
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={0}
                          transform={`rotate(${rotate} ${cx} ${cy})`}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-3xl font-black">{stats?.totalHostels?.toLocaleString() ?? '0'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {statusLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${item.color}`} />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-7 bg-white p-5 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Recent Activity</h3>
            <button
              onClick={() => navigate('/hostels')}
              className="text-sm text-primary font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-6">
            {recentHostels.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
            )}
            {recentHostels.slice(0, 3).map((hostel, idx) => {
              const si = getStatusIcon(hostel.status);
              const list = recentHostels.slice(0, 3);
              const isLast = idx === list.length - 1;
              return (
                <div key={hostel._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className={`material-symbols-outlined ${si.color} text-xl`}>
                        {si.icon}
                      </span>
                    </div>
                    {!isLast && <div className="w-px h-full bg-slate-100 mt-2" />}
                  </div>
                  <div className={`flex-1 ${!isLast ? 'pb-6 border-b border-slate-100' : ''}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900">
                        {hostel.status === 'PENDING' && 'New Hostel Submission'}
                        {hostel.status === 'PENDING_REVIEW' && 'Hostel Updated — Re-review'}
                        {hostel.status === 'APPROVED' && 'Hostel Approved'}
                        {hostel.status === 'REJECTED' && 'Hostel Rejected'}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {timeAgo(hostel.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      "{hostel.name}" {hostel.owner ? `by ${hostel.owner.name}` : ''} ({hostel.city})
                    </p>
                    {(hostel.status === 'PENDING' || hostel.status === 'PENDING_REVIEW') && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/hostels/${hostel._id}`)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
