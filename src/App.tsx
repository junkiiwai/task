import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Main from './pages/Main';
import { AppState, User, Task, Feedback } from './types';
import './styles/global.css';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('todoAppState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        tasks: parsed.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        })),
        feedbacks: parsed.feedbacks.map((feedback: any) => ({
          ...feedback,
          createdAt: new Date(feedback.createdAt),
          updatedAt: new Date(feedback.updatedAt)
        }))
      };
    }
    
    return {
      users: [],
      tasks: [],
      feedbacks: [],
      currentUser: null
    };
  });

  useEffect(() => {
    localStorage.setItem('todoAppState', JSON.stringify(appState));
  }, [appState]);

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const addUser = (user: User) => {
    updateAppState({
      users: [...appState.users, user]
    });
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    updateAppState({
      users: appState.users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      )
    });
  };

  const addTask = (task: Task) => {
    updateAppState({
      tasks: [...appState.tasks, task]
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    updateAppState({
      tasks: appState.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      )
    });
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = appState.tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // 子タスクも削除
    const childTaskIds = taskToDelete.childTaskIds;
    const tasksToDelete = [taskId, ...childTaskIds];
    
    updateAppState({
      tasks: appState.tasks.filter(task => !tasksToDelete.includes(task.id)),
      feedbacks: appState.feedbacks.filter(feedback => !tasksToDelete.includes(feedback.taskId))
    });
  };

  const addFeedback = (feedback: Feedback) => {
    updateAppState({
      feedbacks: [...appState.feedbacks, feedback]
    });
  };

  const updateFeedback = (feedbackId: string, updates: Partial<Feedback>) => {
    updateAppState({
      feedbacks: appState.feedbacks.map(feedback => 
        feedback.id === feedbackId ? { ...feedback, ...updates, updatedAt: new Date() } : feedback
      )
    });
  };

  const deleteFeedback = (feedbackId: string) => {
    updateAppState({
      feedbacks: appState.feedbacks.filter(feedback => feedback.id !== feedbackId)
    });
  };

  const login = (user: User) => {
    updateAppState({ currentUser: user });
  };

  const logout = () => {
    updateAppState({ currentUser: null });
  };

  if (!appState.currentUser) {
    return (
      <Login 
        users={appState.users}
        onLogin={login}
        onAddUser={addUser}
      />
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Main
              appState={appState}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddTask={addTask}
              onAddFeedback={addFeedback}
              onUpdateFeedback={updateFeedback}
              onDeleteFeedback={deleteFeedback}
              onUpdateUser={updateUser}
              onLogout={logout}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
