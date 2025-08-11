export interface User {
  id: string;
  name: string;
  color: UserColor;
}

export type UserColor = 'yellow' | 'blue' | 'green' | 'red' | 'purple';

export interface Task {
  id: string;
  name: string;
  description?: string;
  assigneeId?: string;
  priority: Priority;
  estimatedHours: number;
  dueDate?: Date;
  remainingDays: number;
  progress: number;
  parentTaskId?: string;
  childTaskIds: string[];
  isWorkingOn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = 1 | 2 | 3 | 4 | 5;

export interface Feedback {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  users: User[];
  tasks: Task[];
  feedbacks: Feedback[];
  currentUser: User | null;
}
