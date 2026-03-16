import React, { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { 
  Calendar, 
  Download, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Đầu tháng
    endDate: new Date().toISOString().split('T')[0] // Hôm nay
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary'); // summary, products, categories

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/reports/general?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setData(res.data);
    } catch (error) {
      alert('Lỗi khi tải báo cáo: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const exportExcel = () => {
    if (!data) return;
    
    let exportData = [];
    let fileName = '';

    if (reportType === 'summary') {
      // Sheet 1: Tổng hợp theo ngày
      const dailySheet = XLSX.utils.json_to_sheet(data.dailyStats.map(d => ({
        'Ngày': d.date,
        'Giá trị Nhập (VNĐ)': d.import_value,
        'Giá trị Xuất (VNĐ)': d.export_value,
        'Số phiếu Nhập': d.count_in,
        'Số phiếu Xuất': d.count_out,
        'Chênh lệch': d.export_value - d.import_value
      })));
      
      // Sheet 2: Danh sách chi tiết phiếu
      const logSheet = XLSX.utils.json_to_sheet(data.transactionsLog.map(t => ({
        'Mã phiếu': t.transaction_code,
        'Loại': t.type === 'IN' ? 'Nhập' : 'Xuất',
        'Ngày tạo': new Date(t.created_at).toLocaleString('vi-VN'),
        'Người thực hiện': t.user_name || 'Hệ thống',
        'Giá trị (VNĐ)': t.total_amount,
        'Ghi chú': t.note || ''
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, dailySheet, "Tổng hợp hàng ngày");
      XLSX.utils.book_append_sheet(wb, logSheet, "Danh sách phiếu chi tiết");
      XLSX.writeFile(wb, `Bao-cao-tong-hop-${dateRange.startDate}-den-${dateRange.endDate}.xlsx`);
      return; // Kết thúc hàm sớm vì xử lý nhiều sheet
    } else if (reportType === 'products') {
      exportData = data.topProducts.map((p, i) => ({
        'STT': i + 1,
        'Sản phẩm': p.product_name,
        'SKU': p.sku,
        'Số lượng xuất': p.total_sold,
        'Doanh thu tương ứng': p.revenue
      }));
      fileName = `Top-san-pham-xuat-${dateRange.startDate}-den-${dateRange.endDate}.xlsx`;
    } else if (reportType === 'categories') {
      exportData = data.categoryStats.map((c, i) => ({
        'STT': i + 1,
        'Danh mục': c.category_name,
        'Số lượng sản phẩm': c.total_quantity,
        'Tổng giá trị xuất': c.value
      }));
      fileName = `Bao-cao-danh-muc-${dateRange.startDate}-den-${dateRange.endDate}.xlsx`;
    } else if (reportType === 'slow_products') {
      exportData = data.slowProducts.map((p, i) => ({
        'STT': i + 1,
        'Sản phẩm': p.product_name,
        'SKU': p.sku,
        'Tồn kho hiện tại': p.quantity_in_stock,
        'Số lượng xuất trong kỳ': p.total_sold,
        'Lần cuối xuất': p.last_sold ? new Date(p.last_sold).toLocaleDateString('vi-VN') : 'Chưa từng xuất'
      }));
      fileName = `San-pham-kho-ban-${dateRange.startDate}-den-${dateRange.endDate}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Báo cáo & Thống kê</h1>
          <p className="page-subtitle">Phân tích hoạt động kho hàng theo thời gian.</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Calendar size={14} /> Từ ngày
            </label>
            <input 
              type="date" 
              className="form-control" 
              max={dateRange.endDate || new Date().toISOString().split('T')[0]}
              value={dateRange.startDate}
              onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Calendar size={14} /> Đến ngày
            </label>
            <input 
              type="date" 
              className="form-control" 
              max={new Date().toISOString().split('T')[0]}
              min={dateRange.startDate}
              value={dateRange.endDate}
              onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>Loại báo cáo</label>
            <select 
              className="form-control" 
              value={reportType} 
              onChange={e => setReportType(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="summary">Thống kê tổng kết</option>
              <option value="products">Top sản phẩm bán chạy</option>
              <option value="slow_products">Top sản phẩm khó bán</option>
              <option value="categories">Báo cáo theo danh mục</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
              {loading ? 'Đang tải...' : 'Lấy dữ liệu'}
            </button>
            <button className="btn btn-outline" onClick={exportExcel} disabled={!data}>
              <Download size={16} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Dashboard nhanh */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon indigo"><TrendingUp size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Tổng nhập kho ({data.summary.count_import} phiếu)</p>
                <h3 className="stat-value">{formatVND(data.summary.total_import)}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon emerald"><TrendingDown size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Tổng xuất kho ({data.summary.count_export} phiếu)</p>
                <h3 className="stat-value text-emerald">{formatVND(data.summary.total_export)}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><BarChart2 size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Lợi nhuận gộp</p>
                <h3 className="stat-value text-amber">{formatVND(data.summary.total_export - data.summary.total_import)}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon indigo"><Package size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Tổng số phiếu</p>
                <h3 className="stat-value">{data.summary.total_transactions}</h3>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {reportType === 'summary' && 'Biến động nhập xuất theo ngày'}
                {reportType === 'products' && 'Top sản phẩm bán chạy nhất'}
                {reportType === 'slow_products' && 'Top sản phẩm bán chậm / khó bán'}
                {reportType === 'categories' && 'Phân tích theo danh mục'}
              </h3>
            </div>
            
            <div className="table-wrapper">
              <table style={{ width: '100%' }}>
                <thead>
                  {reportType === 'summary' ? (
                    <tr>
                      <th>Ngày</th>
                      <th style={{ textAlign: 'right' }}>Giá trị Nhập</th>
                      <th style={{ textAlign: 'right' }}>Giá trị Xuất</th>
                      <th style={{ textAlign: 'right' }}>Chênh lệch</th>
                    </tr>
                  ) : reportType === 'products' ? (
                    <tr>
                      <th>Sản phẩm</th>
                      <th>SKU</th>
                      <th style={{ textAlign: 'center' }}>Số lượng xuất</th>
                      <th style={{ textAlign: 'right' }}>Doanh thu dự tính</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Danh mục</th>
                      <th style={{ textAlign: 'center' }}>Số lượng sản phẩm</th>
                      <th style={{ textAlign: 'right' }}>Tổng giá trị xuất</th>
                      <th>Tỉ trọng</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {reportType === 'summary' && data.dailyStats.map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ color: '#6366f1', fontWeight: 500 }}>{formatVND(d.import_value)}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.count_in} phiếu nhập</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ color: '#10b981', fontWeight: 500 }}>{formatVND(d.export_value)}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.count_out} phiếu xuất</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        <div style={{ color: d.export_value - d.import_value >= 0 ? '#10b981' : '#ef4444' }}>
                          {formatVND(d.export_value - d.import_value)}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {reportType === 'products' && data.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="stat-icon emerald" style={{ width: 32, height: 32, fontSize: 12 }}>{i+1}</div>
                          <span style={{ fontWeight: 500 }}>{p.product_name}</span>
                        </div>
                      </td>
                      <td><code>{p.sku}</code></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-green">{p.total_sold}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(p.revenue)}</td>
                    </tr>
                  ))}

                  {reportType === 'slow_products' && data.slowProducts.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="stat-icon rose" style={{ width: 32, height: 32, fontSize: 12 }}>{i+1}</div>
                          <span style={{ fontWeight: 500 }}>{p.product_name}</span>
                        </div>
                      </td>
                      <td><code>{p.sku}</code></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: '#fef2f2', color: '#e11d48' }}>{p.quantity_in_stock}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: '#f8fafc', color: '#64748b' }}>{p.total_sold}</span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>
                        {p.last_sold ? new Date(p.last_sold).toLocaleDateString('vi-VN') : 'Chưa có giao dịch'}
                      </td>
                    </tr>
                  ))}

                  {reportType === 'categories' && data.categoryStats.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Layers size={16} style={{ color: '#6366f1' }} />
                          {c.category_name}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{c.total_quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(c.value)}</td>
                      <td>
                        <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.min(100, (c.value / (data.summary.total_export || 1)) * 100)}%`, 
                            height: '100%', 
                            background: '#6366f1' 
                          }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Section: Chi tiết tất cả các phiếu trong kỳ (chỉ hiện khi ở tab Tổng quát) */}
          {reportType === 'summary' && (
            <div className="card" style={{ padding: 0, marginTop: 24 }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 24px', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Danh sách chi tiết tất cả phiếu nhập & xuất</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Loại</th>
                      <th>Thời gian</th>
                      <th>Người thực hiện</th>
                      <th style={{ textAlign: 'right' }}>Giá trị</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactionsLog.map((t, i) => (
                      <tr key={i}>
                        <td><span style={{ fontWeight: 600, color: t.type === 'IN' ? '#4f46e5' : '#e11d48' }}>{t.transaction_code}</span></td>
                        <td>
                          <span className={`badge ${t.type === 'IN' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                            {t.type === 'IN' ? 'NHẬP' : 'XUẤT'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                        <td style={{ fontSize: 13 }}>{t.user_name || 'Hệ thống'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(t.total_amount)}</td>
                        <td style={{ color: '#64748b', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.note || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
