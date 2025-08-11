import React, { useState } from 'react';
import { Task, User } from '../types';

interface CreateTaskModalProps {
  users: User[];
  tasks: Task[];
  onClose: () => void;
  onCreate: (taskData: Partial<Task>) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  users,
  tasks,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigneeId: '',
    estimatedHours: '',
    dueDate: '',
    parentTaskId: '',
    childTaskIds: [] as string[]
  });

  const [selectedChildTasks, setSelectedChildTasks] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.estimatedHours) {
      alert('タスク名と所要時間は必須入力です。');
      return;
    }

    const taskData: Partial<Task> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      assigneeId: formData.assigneeId || undefined,
      estimatedHours: parseFloat(formData.estimatedHours),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      parentTaskId: formData.parentTaskId || undefined,
      childTaskIds: selectedChildTasks
    };

    onCreate(taskData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChildTaskToggle = (taskId: string) => {
    setSelectedChildTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const topLevelTasks = tasks.filter(task => !task.parentTaskId);

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
        maxWidth: '600px', 
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

        <h2 style={{ marginBottom: '20px' }}>新規タスク作成</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">タスク名 *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="タスク名を入力"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">タスク内容</label>
            <textarea
              className="form-input"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="タスク内容を入力"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">担当者</label>
            <select
              className="form-select"
              value={formData.assigneeId}
              onChange={(e) => handleInputChange('assigneeId', e.target.value)}
            >
              <option value="">担当者を選択</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">所要時間（時間） *</label>
            <input
              type="number"
              className="form-input"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
              placeholder="0.5"
              step="0.5"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">期限</label>
            <input
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">親タスク</label>
            <select
              className="form-select"
              value={formData.parentTaskId}
              onChange={(e) => handleInputChange('parentTaskId', e.target.value)}
            >
              <option value="">親タスクなし（最上位タスク）</option>
              {topLevelTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">子タスク</label>
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '10px',
              maxHeight: '150px',
              overflow: 'auto'
            }}>
              {topLevelTasks.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center' }}>
                  選択可能なタスクがありません
                </p>
              ) : (
                topLevelTasks.map(task => (
                  <label key={task.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedChildTasks.includes(task.id)}
                      onChange={() => handleChildTaskToggle(task.id)}
                      style={{ marginRight: '8px' }}
                    />
                    {task.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              作成
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
