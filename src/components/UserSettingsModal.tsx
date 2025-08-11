import React, { useState } from 'react';
import { User, UserColor } from '../types';

interface UserSettingsModalProps {
  users: User[];
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  users,
  onClose,
  onUpdateUser
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    color: 'yellow' as UserColor
  });

  const userColors: { value: UserColor; label: string; color: string }[] = [
    { value: 'yellow', label: '黄色', color: '#ffeb3b' },
    { value: 'blue', label: '青色', color: '#2196f3' },
    { value: 'green', label: '緑色', color: '#4caf50' },
    { value: 'red', label: '赤色', color: '#f44336' },
    { value: 'purple', label: '紫色', color: '#9c27b0' }
  ];

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      color: user.color
    });
  };

  const handleSave = () => {
    if (editingUser && editForm.name.trim()) {
      onUpdateUser(editingUser.id, {
        name: editForm.name.trim(),
        color: editForm.color
      });
      setEditingUser(null);
      setEditForm({ name: '', color: 'yellow' });
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', color: 'yellow' });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ 
        maxWidth: '500px', 
        maxHeight: '90vh', 
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h2 style={{ marginBottom: '20px' }}>担当者設定</h2>

        {users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            登録されている担当者がいません。
          </p>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            {users.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '10px',
                backgroundColor: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`user-color ${user.color}`} />
                  <span style={{ fontWeight: '500' }}>{user.name}</span>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(user)}
                  style={{ marginLeft: '20px' }}
                >
                  編集
                </button>
              </div>
            ))}
          </div>
        )}

        {editingUser && (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ marginBottom: '15px' }}>担当者編集</h3>
            
            <div className="form-group">
              <label className="form-label">担当者名</label>
              <input
                type="text"
                className="form-input"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="担当者名を入力"
              />
            </div>

            <div className="form-group">
              <label className="form-label">色を選択</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {userColors.map(({ value, label, color }) => (
                  <label key={value} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer' 
                  }}>
                    <input
                      type="radio"
                      name="editUserColor"
                      value={value}
                      checked={editForm.color === value}
                      onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value as UserColor }))}
                      style={{ marginRight: '5px' }}
                    />
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        width: '20px', 
                        height: '20px', 
                        backgroundColor: color, 
                        borderRadius: '50%',
                        marginRight: '5px'
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!editForm.name.trim()}
              >
                保存
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                キャンセル
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;
