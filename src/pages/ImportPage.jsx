import React, { useEffect, useState } from 'react';
import axiosClient from '../services/axiosClient';
import { useGlobalData } from '../context/GlobalDataContext';
import { Plus, ArrowDownLeft, X, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ImportPage = () => {
  const { allProducts: products, fetchAllProducts } = useGlobalData();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [note, setNote] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  
  // Pagination & Search States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, limit]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/transactions?type=IN&page=${page}&limit=${limit}&search=${search}`);
      setTransactions(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleRowClick = async (id) => {
    try {
      const res = await axiosClient.get(`/transactions/${id}`);
      setSelectedTx(res.data);
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = field === 'product_id' ? value : Number(value);
    if (field === 'product_id') {
      const prod = products.find(p => p.id === Number(value));
      if (prod) updated[idx].unit_price = Number(prod.price);
    }
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) return alert('Vui lòng thêm ít nhất 1 sản phẩm');
    try {
      await axiosClient.post('/transactions', {
        type: 'IN',
        note,
        items: validItems.map(i => ({ ...i, product_id: Number(i.product_id) }))
      });
      setShowModal(false);
      setNote('');
      setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
      fetchTransactions();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nhập kho</h1>
          <p className="page-subtitle">Quản lý các phiếu nhập hàng vào kho.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Tạo phiếu nhập
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-toolbar">
          <form className="table-search" onSubmit={handleSearch}>
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Tìm mã phiếu (PN...)" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Ngày tạo</th>
                <th>Người thực hiện</th>
                <th>Số mặt hàng</th>
                <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>
                  <div className="spinner"></div><p style={{ color: '#64748b' }}>Đang tải...</p>
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-icon"><ArrowDownLeft size={32} /></div>
                    <p className="empty-title">Không tìm thấy phiếu nhập</p>
                    <p className="empty-text">Hãy thử thay đổi từ khóa tìm kiếm.</p>
                  </div>
                </td></tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} onClick={() => handleRowClick(tx.id)} style={{ cursor: 'pointer' }}>
                  <td><span style={{ fontWeight: 600, color: '#4f46e5' }}>{tx.transaction_code}</span></td>
                  <td>{formatDate(tx.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                        {(tx.user_name || 'U').substring(0, 1).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13 }}>{tx.user_name || 'Hệ thống'}</span>
                    </div>
                  </td>
                  <td>{tx.item_count} sản phẩm</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatPrice(tx.total_amount)}</td>
                  <td style={{ color: '#64748b' }}>{tx.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Hiển thị <strong>{transactions.length}</strong> / <strong>{total}</strong> phiếu</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Trang {page} / {totalPages || 1}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="action-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
              <button className="action-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
            <div className="modal-header">
              <h3>Tạo phiếu nhập kho</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Ghi chú</label>
                  <input className="form-control" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="VD: Nhập hàng từ NCC A" />
                </div>
                {/* ... Render items logic ... */}
                <div className="form-row-grid" style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Sản phẩm</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Số lượng</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Đơn giá</div>
                  <div></div>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="form-row-grid" style={{ marginBottom: 8 }}>
                    <select className="form-control form-select" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} required>
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input className="form-control" type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required style={{ textAlign: 'center' }} />
                    <input className="form-control" type="number" min="0" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} required style={{ textAlign: 'right' }} />
                    {items.length > 1 && <button type="button" className="action-btn delete" onClick={() => removeItem(idx)}><Trash2 size={14} /></button>}
                  </div>
                ))}
                <button type="button" className="btn btn-outline" onClick={addItem}>+ Thêm sản phẩm</button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu phiếu nhập</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
            <div className="modal-header">
              <h3>Chi tiết phiếu nhập #{selectedTx.transaction_code}</h3>
              <button className="modal-close" onClick={() => setSelectedTx(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px 0' }}>
               {/* Same content as before */}
               <div style={{ padding: '0 24px', marginBottom: 16 }}>
                 <p><strong>Ngày:</strong> {formatDate(selectedTx.created_at)}</p>
                 <p><strong>Người thực hiện:</strong> {selectedTx.user_name || 'Hệ thống'}</p>
                 <p><strong>Ghi chú:</strong> {selectedTx.note || '—'}</p>
                 <p><strong>Tổng tiền:</strong> {formatPrice(selectedTx.total_amount)}</p>
               </div>
               <div className="table-wrapper">
                 <table>
                   <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th></tr></thead>
                   <tbody>
                     {selectedTx.items?.map((item, i) => (
                       <tr key={i}><td>{item.product_name}</td><td>{item.quantity}</td><td>{formatPrice(item.unit_price)}</td></tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
