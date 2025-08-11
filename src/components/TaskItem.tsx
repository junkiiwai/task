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
      padding: '5px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: task.childTaskIds.length > 0 ? '2px' : '0px'
    }}>
      {/* メインタスク情報 */}
      <div 
        onClick={() => onTaskClick(task)}
        style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto auto auto auto',
          gap: '5px',
          alignItems: 'center',
          minHeight: '24px'
        }}
      >
        {/* タスク名 */}
        <div style={{ 
          fontWeight: '600',
          textAlign: 'left',
          paddingLeft: level === 0 ? '0px' : '0px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {getTaskHierarchy(task, allTasks, level)}
        </div>

        {/* 担当者 */}
        <div style={{ textAlign: 'center', minWidth: '45px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {assignee.name}
            </div>
          ) : (
            <span style={{ color: '#666' }}>未設定</span>
          )}
        </div>

        {/* 期限（600px以上で表示） */}
        <div className="due-date-column" style={{ textAlign: 'center', minWidth: '45px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.dueDate ? (
            <span>{new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
          ) : (
            <span style={{ color: '#666' }}>-</span>
          )}
        </div>

        {/* 所要時間（800px以上で表示） */}
        <div className="hours-column" style={{ textAlign: 'center', minWidth: '45px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.estimatedHours > 0 ? `${task.estimatedHours}h` : '-'}
        </div>

        {/* 残日数 */}
        <div style={{ textAlign: 'center', minWidth: '45px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.remainingDays > 0 ? `残${task.remainingDays}日` : '期限切れ'}
        </div>

        {/* 進捗度 */}
        <div style={{ textAlign: 'center', minWidth: '45px', fontSize: '11px' }}>
          <div style={{ marginBottom: '2px' }}>{task.progress}%</div>
          <div className="progress-bar" style={{ height: '6px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* 優先度 */}
        <div style={{ textAlign: 'center', minWidth: '45px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span className={`priority-badge priority-${task.priority}`} style={{ padding: '1px 4px', fontSize: '9px' }}>
            優先度{task.priority}
          </span>
        </div>
      </div>



      {/* 子タスク */}
      {childTasks.length > 0 && (
        <div style={{ marginTop: '0px', paddingLeft: '15px' }}>
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
