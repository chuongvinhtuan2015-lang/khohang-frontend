import React, { useEffect, useState } from 'react';
import axiosClient from '../services/axiosClient';
import { Plus, Users as UsersIcon, X, Edit2, Trash2 } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', full_name: '', email: '', phone: '', role: 'STAFF', password: '123456' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/users', form);
      setShowModal(false);
      setForm({ username: '', full_name: '', email: '', phone: '', role: 'STAFF', password: '123456' });
      fetchUsers();
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  const roleLabel = (role) => {
    const map = { ADMIN: 'Quản trị', MANAGER: 'Quản lý', STAFF: 'Nhân viên' };
    return map[role] || role;
  };

  const roleColor = (role) => {
    if (role === 'ADMIN') return 'badge-red';
    if (role === 'MANAGER') return 'badge-green';
    return '';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nhân viên</h1>
          <p className="page-subtitle">Quản lý thành viên trong hệ thống.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Thêm nhân viên
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>
                  <div className="spinner"></div><p style={{ color: '#64748b' }}>Đang tải...</p>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-icon"><UsersIcon size={32} /></div>
                    <p className="empty-title">Chưa có nhân viên</p>
                    <p className="empty-text">Thêm nhân viên đầu tiên.</p>
                  </div>
                </td></tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-avatar">{(user.full_name || user.username).substring(0, 2).toUpperCase()}</div>
                      <div>
                        <p className="product-name">{user.full_name || user.username}</p>
                        <p className="product-unit">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.email || '—'}</td>
                  <td>{user.phone || '—'}</td>
                  <td><span className={`badge ${roleColor(user.role)}`}>{roleLabel(user.role)}</span></td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns" style={{ opacity: 1 }}>
                      <button className="action-btn delete" onClick={() => handleDelete(user.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm nhân viên</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên đăng nhập *</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Điện thoại</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="STAFF">Nhân viên</option>
                    <option value="MANAGER">Quản lý</option>
                    <option value="ADMIN">Quản trị</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm nhân viên</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
