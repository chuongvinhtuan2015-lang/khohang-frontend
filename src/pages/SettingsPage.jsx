import React from 'react';
import { Settings as SettingsIcon, Database, Shield, Bell, Palette } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cài đặt</h1>
          <p className="page-subtitle">Tùy chỉnh cấu hình hệ thống.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="stat-icon indigo"><Database size={20} /></div>
            <div>
              <h3 className="card-title">Cơ sở dữ liệu</h3>
              <p className="card-subtitle">MySQL • ManagementInventory</p>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
            <p>Host: <strong>localhost</strong></p>
            <p>Port: <strong>3306</strong></p>
            <p>Trạng thái: <span className="badge badge-green">Đã kết nối</span></p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="stat-icon emerald"><Shield size={20} /></div>
            <div>
              <h3 className="card-title">Bảo mật</h3>
              <p className="card-subtitle">Cấu hình JWT & xác thực</p>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
            <p>Xác thực: <strong>JWT Token</strong></p>
            <p>Hết hạn: <strong>24 giờ</strong></p>
            <p>Trạng thái: <span className="badge badge-green">Bật</span></p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="stat-icon amber"><Bell size={20} /></div>
            <div>
              <h3 className="card-title">Thông báo</h3>
              <p className="card-subtitle">Cài đặt cảnh báo hệ thống</p>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Cảnh báo hàng sắp hết
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Thông báo nhập/xuất kho
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" /> Gửi email báo cáo hàng tuần
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="stat-icon rose"><Palette size={20} /></div>
            <div>
              <h3 className="card-title">Giao diện</h3>
              <p className="card-subtitle">Tùy chỉnh hiển thị</p>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
            <p>Ngôn ngữ: <strong>Tiếng Việt</strong></p>
            <p>Chế độ: <strong>Sáng</strong></p>
            <p>Font: <strong>Inter</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
