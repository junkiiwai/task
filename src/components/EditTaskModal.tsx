import React, { useState } from 'react';
import { Task, User, Feedback } from '../types';
import { format } from 'date-fns';

interface EditTaskModalProps {
  task: Task;
  users: User[];
  tasks: Task[];
  feedbacks: Feedback[];
  currentUser: User;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddFeedback: (feedback: Feedback) => void;
  onUpdateFeedback: (feedbackId: string, updates: Partial<Feedback>) => void;
  onDeleteFeedback: (feedbackId: string) => void;
  onWorkingOnToggle: (taskId: string) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  users,
  tasks,
  feedbacks,
  currentUser,
  onClose,
  onUpdate,
  onDelete,
  onAddFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
  onWorkingOnToggle
}) => {
  const [editForm, setEditForm] = useState({
    name: task.name,
    description: task.description || '',
    assigneeId: task.assigneeId || '',
    estimatedHours: task.estimatedHours.toString(),
    dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
    parentTaskId: task.parentTaskId || '',
    childTaskIds: task.childTaskIds
  });

  const [newFeedback, setNewFeedback] = useState('');
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editFeedbackContent, setEditFeedbackContent] = useState('');

  const assignee = users.find(u => u.id === task.assigneeId);
  const canEditTimeAndProgress = task.childTaskIds.length === 0;
  const topLevelTasks = tasks.filter(t => !t.parentTaskId && t.id !== task.id);

  const handleSave = () => {
    if (!editForm.name.trim()) {
      alert('タスク名は必須です。');
      return;
    }

    const updates: Partial<Task> = {
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      assigneeId: editForm.assigneeId || undefined,
      parentTaskId: editForm.parentTaskId || undefined,
      childTaskIds: editForm.childTaskIds
    };

    if (canEditTimeAndProgress) {
      updates.estimatedHours = parseFloat(editForm.estimatedHours);
      updates.dueDate = editForm.dueDate ? new Date(editForm.dueDate) : undefined;
    }

    onUpdate(task.id, updates);
  };

  const handleAddFeedback = () => {
    if (newFeedback.trim()) {
      const feedback: Feedback = {
        id: Date.now().toString(),
        taskId: task.id,
        userId: currentUser.id,
        content: newFeedback.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onAddFeedback(feedback);
      setNewFeedback('');
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setEditFeedbackContent(feedback.content);
  };

  const handleSaveFeedback = () => {
    if (editingFeedback && editFeedbackContent.trim()) {
      onUpdateFeedback(editingFeedback.id, { content: editFeedbackContent.trim() });
      setEditingFeedback(null);
      setEditFeedbackContent('');
    }
  };

  const handleWorkingOnToggle = () => {
    onWorkingOnToggle(task.id);
  };

  const handleDelete = () => {
    if (confirm('このタスクを削除しますか？子タスクも含めて削除されます。')) {
      onDelete(task.id);
      onClose();
    }
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
        maxWidth: '800px', 
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

        <h2 style={{ marginBottom: '20px' }}>タスク編集</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 左側：タスク情報 */}
          <div>
            <h3 style={{ marginBottom: '15px' }}>タスク情報</h3>
            
            <div className="form-group">
              <label className="form-label">タスク名 *</label>
              <input
                type="text"
                className="form-input"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="タスク名を入力"
              />
            </div>

            <div className="form-group">
              <label className="form-label">タスク内容</label>
              <textarea
                className="form-input"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="タスク内容を入力"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">担当者</label>
              <select
                className="form-select"
                value={editForm.assigneeId}
                onChange={(e) => setEditForm(prev => ({ ...prev, assigneeId: e.target.value }))}
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
              <label className="form-label">所要時間（時間）</label>
              <input
                type="number"
                className="form-input"
                value={editForm.estimatedHours}
                onChange={(e) => setEditForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                placeholder="0.5"
                step="0.5"
                min="0"
                disabled={!canEditTimeAndProgress}
              />
              {!canEditTimeAndProgress && (
                <small style={{ color: '#666' }}>
                  子タスクを持つタスクの所要時間は自動計算されます
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">期限</label>
              <input
                type="date"
                className="form-input"
                value={editForm.dueDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                disabled={!canEditTimeAndProgress}
              />
              {!canEditTimeAndProgress && (
                <small style={{ color: '#666' }}>
                  子タスクを持つタスクの期限は編集できません
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">親タスク</label>
              <select
                className="form-select"
                value={editForm.parentTaskId}
                onChange={(e) => setEditForm(prev => ({ ...prev, parentTaskId: e.target.value }))}
              >
                <option value="">親タスクなし（最上位タスク）</option>
                {topLevelTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 現在作業中チェックボックス */}
            {task.assigneeId === currentUser.id && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={task.isWorkingOn}
                    onChange={handleWorkingOnToggle}
                  />
                  現在作業中
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleSave}>
                保存
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                削除
              </button>
            </div>
          </div>

          {/* 右側：フィードバック */}
          <div>
            <h3 style={{ marginBottom: '15px' }}>現状・課題↔︎FB</h3>
            
            <div className="form-group">
              <textarea
                className="form-input"
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                placeholder="作業内容やフィードバックを入力"
                rows={3}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleAddFeedback}
                disabled={!newFeedback.trim()}
                style={{ marginTop: '10px' }}
              >
                保存
              </button>
            </div>

            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {feedbacks.map(feedback => {
                const feedbackUser = users.find(u => u.id === feedback.userId);
                return (
                  <div key={feedback.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: 'white'
                  }}>
                    {editingFeedback?.id === feedback.id ? (
                      <div>
                        <textarea
                          className="form-input"
                          value={editFeedbackContent}
                          onChange={(e) => setEditFeedbackContent(e.target.value)}
                          rows={3}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={handleSaveFeedback}
                            disabled={!editFeedbackContent.trim()}
                          >
                            保存
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setEditingFeedback(null)}
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`user-color ${feedbackUser?.color || 'yellow'}`} />
                            <span style={{ fontWeight: '500' }}>{feedbackUser?.name || '不明'}</span>
                            <span style={{ color: '#666', fontSize: '12px' }}>
                              {format(feedback.createdAt, 'yyyy/MM/dd HH:mm')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleEditFeedback(feedback)}
                            >
                              編集
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => onDeleteFeedback(feedback.id)}
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: 0, lineHeight: '1.5' }}>{feedback.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
