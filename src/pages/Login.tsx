import React, { useState } from 'react';
import { User, UserColor } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onAddUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, onAddUser }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserColor, setNewUserColor] = useState<UserColor>('yellow');

  const handleLogin = () => {
    if (selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        onLogin(user);
      }
    }
  };

  const handleAddUser = () => {
    if (newUserName.trim()) {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName.trim(),
        color: newUserColor
      };
      onAddUser(newUser);
      setNewUserName('');
      setNewUserColor('yellow');
      setShowUserForm(false);
      setSelectedUserId(newUser.id);
    }
  };

  const userColors: { value: UserColor; label: string; color: string }[] = [
    { value: 'yellow', label: '黄色', color: '#ffeb3b' },
    { value: 'blue', label: '青色', color: '#2196f3' },
    { value: 'green', label: '緑色', color: '#4caf50' },
    { value: 'red', label: '赤色', color: '#f44336' },
    { value: 'purple', label: '紫色', color: '#9c27b0' }
  ];

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Todo管理ツール</h1>
        
        <div className="form-group">
          <label className="form-label">担当者を選択</label>
          <select 
            className="form-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">担当者を選択してください</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={handleLogin}
          >
            ログイン
          </button>
        )}

        <hr style={{ margin: '20px 0' }} />

        <button 
          className="btn btn-secondary" 
          style={{ width: '100%' }}
          onClick={() => setShowUserForm(!showUserForm)}
        >
          {showUserForm ? 'キャンセル' : '担当者登録'}
        </button>

        {showUserForm && (
          <div style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">担当者名</label>
              <input
                type="text"
                className="form-input"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="担当者名を入力"
              />
            </div>

            <div className="form-group">
              <label className="form-label">色を選択</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {userColors.map(({ value, label, color }) => (
                  <label key={value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="userColor"
                      value={value}
                      checked={newUserColor === value}
                      onChange={(e) => setNewUserColor(e.target.value as UserColor)}
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

            <button 
              className="btn btn-success" 
              style={{ width: '100%' }}
              onClick={handleAddUser}
              disabled={!newUserName.trim()}
            >
              登録
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
