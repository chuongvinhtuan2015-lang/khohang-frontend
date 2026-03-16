import React, { useEffect, useState } from 'react';
import axiosClient from '../services/axiosClient';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2,
  Package,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ProductList = () => {
  const { isManager } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', category_id: '', supplier_id: '', unit: '', price: '' });
  
  // Pagination & Filter States
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCategoriesAndSuppliers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, limit, categoryId]); // Reload when page or filter changes

  const fetchCategoriesAndSuppliers = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        axiosClient.get('/categories'),
        axiosClient.get('/suppliers')
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/products?page=${page}&limit=${limit}&search=${search}&category_id=${categoryId}`);
      setProducts(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/products', {
        ...form,
        price: Number(form.price)
      });
      setShowModal(false);
      setForm({ sku: '', name: '', category_id: '', supplier_id: '', unit: '', price: '' });
      fetchProducts();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const exportToExcel = () => {
    const dataToExport = products.map((item, index) => ({
      "STT": (page - 1) * limit + index + 1,
      "Mã SKU": item.sku,
      "Tên Sản Phẩm": item.name,
      "Danh Mục": item.category_name || 'Mặc định',
      "Đơn Vị": item.unit,
      "Đơn Giá": item.price,
      "Tồn Kho": item.quantity_in_stock
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSanPham");
    XLSX.writeFile(workbook, "Bao-cao-ton-kho.xlsx");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kho sản phẩm</h1>
          <p className="page-subtitle">Quản lý và theo dõi tồn kho theo thời gian thực.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportToExcel} style={{ marginRight: 8 }}>
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
          {isManager() && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Thêm sản phẩm
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-toolbar">
          <form className="table-search" onSubmit={handleSearch}>
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Tìm theo SKU hoặc tên..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          <div style={{ display: 'flex', gap: 8 }}>
            <select 
              className="form-control form-select" 
              style={{ width: 180 }}
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setPage(1); }}
            >
              <option value="">-- Tất cả danh mục --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                <th style={{ textAlign: 'center' }}>Tồn kho</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="spinner"></div>
                    <p style={{ color: '#64748b', marginTop: 12 }}>Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Package size={32} />
                      </div>
                      <p className="empty-title">Không tìm thấy sản phẩm</p>
                      <p className="empty-text">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-avatar">
                          {product.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="product-name">{product.name}</p>
                          <div className="product-meta">
                            <span className="product-sku">{product.sku}</span>
                            <span className="product-unit">• {product.unit}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="product-category">
                        <Layers size={14} style={{ color: '#94a3b8' }} />
                        {product.category_name || 'Mặc định'}
                      </div>
                    </td>
                    <td className="product-price" style={{ textAlign: 'right' }}>
                      {formatPrice(product.price)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${product.quantity_in_stock > 10 ? 'badge-green' : 'badge-red'}`}>
                        {product.quantity_in_stock} {product.unit}
                      </span>
                    </td>
                    <td>
                      {isManager() && (
                        <div className="action-btns" style={{ opacity: 1 }}>
                          <button className="action-btn delete" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div className="table-footer">
          <span>Hiển thị <strong>{products.length}</strong> / <strong>{total}</strong> sản phẩm</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Trang {page} / {totalPages || 1}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button 
                className="action-btn" 
                style={{ border: '1px solid #e2e8f0' }}
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="action-btn" 
                style={{ border: '1px solid #e2e8f0' }}
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 500 }}>
            <div className="modal-header">
              <h3>Thêm sản phẩm mới</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Mã sản phẩm (SKU) *</label>
                    <input className="form-control" type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required placeholder="VD: SP001" />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Tên sản phẩm *</label>
                    <input className="form-control" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Tên sản phẩm" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Danh mục</label>
                    <select className="form-control form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Nhà cung cấp</label>
                    <select className="form-control form-select" value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
                      <option value="">-- Chọn NCC --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Đơn vị tính *</label>
                    <input className="form-control" type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required placeholder="Chiếc, Hộp, Kg..." />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Đơn giá (VNĐ) *</label>
                    <input className="form-control" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
