import React, { useState } from 'react';
import { AppState, Task, User, Feedback } from '../types';
import { 
  getTopLevelTasks, 
  getCompletedTasks, 
  calculateEstimatedHours, 
  calculateProgress,
  calculateRemainingDays,
  calculatePriority
} from '../utils/taskUtils';
import TaskItem from '../components/TaskItem';
import CreateTaskModal from '../components/CreateTaskModal';
import UserSettingsModal from '../components/UserSettingsModal';
import EditTaskModal from '../components/EditTaskModal';

interface MainProps {
  appState: AppState;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Task) => void;
  onAddFeedback: (feedback: Feedback) => void;
  onUpdateFeedback: (feedbackId: string, updates: Partial<Feedback>) => void;
  onDeleteFeedback: (feedbackId: string) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onLogout: () => void;
}

const Main: React.FC<MainProps> = ({
  appState,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onAddFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
  onUpdateUser,
  onLogout
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { users, tasks, feedbacks, currentUser } = appState;
  
  // タスクの自動計算を実行
  React.useEffect(() => {
    tasks.forEach(task => {
      const estimatedHours = calculateEstimatedHours(task, tasks);
      const progress = calculateProgress(task, tasks);
      const remainingDays = calculateRemainingDays(task.dueDate);
      const priority = calculatePriority({
        ...task,
        estimatedHours,
        progress,
        remainingDays
      });

      if (
        task.estimatedHours !== estimatedHours ||
        task.progress !== progress ||
        task.remainingDays !== remainingDays ||
        task.priority !== priority
      ) {
        onUpdateTask(task.id, {
          estimatedHours,
          progress,
          remainingDays,
          priority
        });
      }
    });
  }, [tasks, onUpdateTask]);

  // 完了したタスクを完了ゾーンに移動
  React.useEffect(() => {
    const completedTasks = getCompletedTasks(tasks);
    completedTasks.forEach(task => {
      if (task.parentTaskId) {
        const parentTask = tasks.find(t => t.id === task.parentTaskId);
        if (parentTask && parentTask.progress === 100) {
          // 親タスクも完了している場合は何もしない（既に完了ゾーンに移動済み）
          return;
        }
      }
    });
  }, [tasks, onUpdateTask]);

  const topLevelTasks = getTopLevelTasks(tasks);
  const completedTasks = getCompletedTasks(tasks);

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: taskData.name || '',
      description: taskData.description || '',
      assigneeId: taskData.assigneeId,
      priority: 1,
      estimatedHours: taskData.estimatedHours || 0,
      dueDate: taskData.dueDate,
      remainingDays: calculateRemainingDays(taskData.dueDate),
      progress: 0,
      parentTaskId: taskData.parentTaskId,
      childTaskIds: taskData.childTaskIds || [],
      isWorkingOn: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onAddTask(newTask);
    setShowCreateModal(false);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleWorkingOnToggle = (taskId: string) => {
    // 他のタスクの「現在作業中」を解除
    tasks.forEach(task => {
      if (task.id !== taskId && task.isWorkingOn && task.assigneeId === currentUser?.id) {
        onUpdateTask(task.id, { isWorkingOn: false });
      }
    });

    // 選択されたタスクの「現在作業中」を切り替え
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask(taskId, { isWorkingOn: !task.isWorkingOn });
    }
  };

  return (
    <div className="container">
      {/* ヘッダー */}
      <header className="header" style={{ 
        padding: '20px 0',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h1>タスク</h1>
          <div className="header-buttons" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setShowUserSettings(true)}>
              担当者設定
            </button>
            <button className="btn btn-danger" onClick={onLogout}>
              ログアウト
            </button>
          </div>
        </div>
        <div className="user-info" style={{ fontSize: '14px', color: '#666' }}>
          ログイン中: {currentUser?.name}
        </div>
      </header>

      {/* 新規作成ボタン */}
      <div style={{ margin: '20px 0' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          新規作成
        </button>
      </div>

      {/* プロジェクトゾーン */}
      <section className="card">
        <h2 className="section-title">プロジェクト</h2>
        <div className="task-grid" style={{ display: 'grid', gap: '0px' }}>
          {topLevelTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              users={users}
              allTasks={tasks}
              onTaskClick={handleTaskClick}
              onWorkingOnToggle={handleWorkingOnToggle}
              currentUser={currentUser}
            />
          ))}
          {topLevelTasks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666' }}>
              タスクがありません。新規作成ボタンからタスクを作成してください。
            </p>
          )}
        </div>
      </section>

      {/* 完了ゾーン */}
      <section className="card">
        <h2 className="section-title">完了</h2>
        <div className="task-grid" style={{ display: 'grid', gap: '0px' }}>
          {completedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              users={users}
              allTasks={tasks}
              onTaskClick={handleTaskClick}
              onWorkingOnToggle={handleWorkingOnToggle}
              currentUser={currentUser}
              isCompleted
            />
          ))}
          {completedTasks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666' }}>
              完了したタスクがありません。
            </p>
          )}
        </div>
      </section>

      {/* モーダル */}
      {showCreateModal && (
        <CreateTaskModal
          users={users}
          tasks={tasks}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}

      {showUserSettings && (
        <UserSettingsModal
          users={users}
          onClose={() => setShowUserSettings(false)}
          onUpdateUser={onUpdateUser}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          users={users}
          tasks={tasks}
          feedbacks={feedbacks.filter(f => f.taskId === editingTask.id)}
          currentUser={currentUser!}
          onClose={() => setEditingTask(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          onAddFeedback={onAddFeedback}
          onUpdateFeedback={onUpdateFeedback}
          onDeleteFeedback={onDeleteFeedback}
          onWorkingOnToggle={handleWorkingOnToggle}
        />
      )}
    </div>
  );
};

export default Main;
