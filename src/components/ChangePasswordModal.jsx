import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../services/axiosClient';

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      return alert('Mật khẩu xác nhận không khớp');
    }

    if (form.newPassword.length < 6) {
      return alert('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      alert(res.data.message);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="stat-icon rose" style={{ width: 32, height: 32 }}>
              <Lock size={16} />
            </div>
            <h3>Đổi mật khẩu</h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 24px' }}>
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPass.old ? "text" : "password"} 
                  className="form-control"
                  value={form.oldPassword}
                  onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                  required
                  placeholder="Nhập mật khẩu cũ"
                />
                <button 
                  type="button" 
                  onClick={() => toggleShow('old')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPass.old ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPass.new ? "text" : "password"} 
                  className="form-control"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button 
                  type="button" 
                  onClick={() => toggleShow('new')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPass.confirm ? "text" : "password"} 
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button 
                  type="button" 
                  onClick={() => toggleShow('confirm')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#f8fafc', borderRadius: 8, marginTop: 8 }}>
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Mật khẩu nên bao gồm chữ cái và số.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
