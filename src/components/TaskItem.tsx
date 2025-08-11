import React from 'react';
import { Task, User } from '../types';
import { getChildTasks, getTaskHierarchy } from '../utils/taskUtils';

interface TaskItemProps {
  task: Task;
  users: User[];
  allTasks: Task[];
  onTaskClick: (task: Task) => void;
  onWorkingOnToggle: (taskId: string) => void;
  currentUser: User | null;
  isCompleted?: boolean;
  level?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  users,
  allTasks,
  onTaskClick,
  onWorkingOnToggle,
  currentUser,
  isCompleted = false,
  level = 0
}) => {
  const assignee = users.find(u => u.id === task.assigneeId);
  const childTasks = getChildTasks(task.id, allTasks);
  const canEdit = !task.childTaskIds.length || level === 0;

  const handleWorkingOnToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.assigneeId === currentUser?.id) {
      onWorkingOnToggle(task.id);
    }
  };

  const taskClasses = [
    'task-item',
    isCompleted ? 'completed-task' : '',
    task.isWorkingOn ? `working-on ${assignee?.color || ''}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={taskClasses} style={{ 
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}>
      {/* メインタスク情報 */}
      <div 
        onClick={() => onTaskClick(task)}
        style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto auto',
          gap: '15px',
          alignItems: 'center',
          minHeight: '40px'
        }}
      >
        {/* タスク名 */}
        <div style={{ 
          fontWeight: '500',
          textAlign: 'left',
          paddingLeft: `${level * 20}px`
        }}>
          {getTaskHierarchy(task, allTasks, level)}
        </div>

        {/* 担当者 */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          {assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className={`user-color ${assignee.color}`} />
              {assignee.name}
            </div>
          ) : (
            <span style={{ color: '#666' }}>未設定</span>
          )}
        </div>

        {/* 残日数 */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          {task.remainingDays > 0 ? `残${task.remainingDays}日` : '期限切れ'}
        </div>

        {/* 進捗度 */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ marginBottom: '5px' }}>{task.progress}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* 優先度 */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <span className={`priority-badge priority-${task.priority}`}>
            優先度{task.priority}
          </span>
        </div>
      </div>

      {/* 現在作業中チェックボックス */}
      {canEdit && task.assigneeId === currentUser?.id && (
        <div style={{ 
          marginTop: '10px', 
          paddingTop: '10px', 
          borderTop: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <input
            type="checkbox"
            checked={task.isWorkingOn}
            onChange={handleWorkingOnToggle}
            style={{ cursor: 'pointer' }}
          />
          <label style={{ cursor: 'pointer', fontSize: '14px' }}>
            現在作業中
          </label>
        </div>
      )}

      {/* 子タスク */}
      {childTasks.length > 0 && (
        <div style={{ marginTop: '15px', paddingLeft: '20px' }}>
          {childTasks.map(childTask => (
            <TaskItem
              key={childTask.id}
              task={childTask}
              users={users}
              allTasks={allTasks}
              onTaskClick={onTaskClick}
              onWorkingOnToggle={onWorkingOnToggle}
              currentUser={currentUser}
              isCompleted={isCompleted}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
