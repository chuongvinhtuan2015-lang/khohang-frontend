import React, { useEffect, useState } from 'react';
import axiosClient from '../services/axiosClient';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="stat-label">{title}</p>
    <p className="stat-value">{value}</p>
  </div>
);

// Simple CSS bar chart - no external library needed
const BarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <div className="chart-placeholder-icon"><TrendingUp size={24} /></div>
        <p>Chưa có dữ liệu giao dịch</p>
        <p className="subtitle">Tạo phiếu nhập/xuất để thấy biểu đồ</p>
      </div>
    );
  }

  // Nhóm dữ liệu theo label (ngày/tuần/tháng)
  const groupedData = data.reduce((acc, current) => {
    const { label, type, total } = current;
    if (!acc[label]) acc[label] = { label, inTotal: 0, outTotal: 0 };
    if (type === 'IN') acc[label].inTotal = Number(total);
    if (type === 'OUT') acc[label].outTotal = Number(total);
    return acc;
  }, {});

  const chartData = Object.values(groupedData);
  const maxVal = Math.max(...chartData.map(d => Math.max(d.inTotal, d.outTotal)), 1);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
          <span style={{ width: 10, height: 10, background: '#4f46e5', borderRadius: 2, display: 'inline-block' }}></span> Nhập
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
          <span style={{ width: 10, height: 10, background: '#f43f5e', borderRadius: 2, display: 'inline-block' }}></span> Xuất
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 220, overflowX: 'auto', paddingBottom: 10 }}>
        {chartData.map((day, i) => (
          <div key={i} style={{ minWidth: 40, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 180, width: '100%' }}>
              <div
                style={{
                  flex: 1,
                  height: `${Math.max((day.inTotal / maxVal) * 100, 2)}%`,
                  background: '#4f46e5',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease',
                  minHeight: 2,
                }}
                title={`Nhập: ${day.inTotal.toLocaleString('vi-VN')}đ`}
              ></div>
              <div
                style={{
                  flex: 1,
                  height: `${Math.max((day.outTotal / maxVal) * 100, 2)}%`,
                  background: '#f43f5e',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease',
                  minHeight: 2,
                }}
                title={`Xuất: ${day.outTotal.toLocaleString('vi-VN')}đ`}
              ></div>
            </div>
            <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', transform: chartData.length > 7 ? 'rotate(-30deg)' : 'none', marginTop: 4 }}>
              {day.label.split('-').reverse().slice(0, 2).reverse().join('/') || day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatPrice = (p) => {
  if (p >= 1e9) return (p / 1e9).toFixed(1) + ' tỷ';
  if (p >= 1e6) return (p / 1e6).toFixed(1) + ' tr';
  if (p >= 1e3) return (p / 1e3).toFixed(0) + 'k';
  return String(p);
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('week');

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`/dashboard?range=${range}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div className="spinner"></div>
        <p style={{ color: '#64748b' }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard title="Tổng sản phẩm" value={stats.totalProducts || 0} icon={Package} color="indigo" />
        <StatCard title="Phiếu nhập" value={stats.totalImports || 0} icon={ArrowDownLeft} color="emerald" />
        <StatCard title="Phiếu xuất" value={stats.totalExports || 0} icon={ShoppingBag} color="rose" />
        <StatCard title="Hàng sắp hết" value={stats.lowStock || 0} icon={AlertCircle} color="amber" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Biểu đồ nhập/xuất kho</h3>
              <p className="card-subtitle">Theo giá trị giao dịch</p>
            </div>
            <select 
              className="form-control form-select" 
              style={{ width: 140 }}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
          <BarChart data={data?.chart || []} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3 className="card-title">Giao dịch gần đây</h3>
            </div>
            <div className="notification-list">
              {(data?.recent || []).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>Chưa có giao dịch nào</p>
              ) : (
                data.recent.map((tx, i) => (
                  <div key={i} className="notification-item">
                    <div className={`notification-dot ${tx.type === 'IN' ? 'green' : 'red'}`}></div>
                    <div style={{ flex: 1 }}>
                      <p className="notification-title">
                        {tx.type === 'IN' ? 'Nhập kho' : 'Xuất kho'} — {tx.transaction_code}
                      </p>
                      <p className="notification-time">
                        {tx.item_count} sản phẩm • {formatPrice(Number(tx.total_amount))}đ • {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <p className="card-title" style={{ marginBottom: 4 }}>Giá trị kho</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Tổng giá trị nhập - xuất</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
              {formatPrice(stats.totalImportAmount - stats.totalExportAmount)}đ
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13 }}>
              <span style={{ color: '#059669' }}>↓ Nhập: {formatPrice(stats.totalImportAmount)}đ</span>
              <span style={{ color: '#e11d48' }}>↑ Xuất: {formatPrice(stats.totalExportAmount)}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
