import { Task, Priority } from '../types';
import { differenceInDays, isAfter, startOfDay } from 'date-fns';

export const calculatePriority = (task: Task): Priority => {
  if (!task.dueDate) return 1;
  
  const today = startOfDay(new Date());
  const dueDate = startOfDay(task.dueDate);
  
  if (isAfter(today, dueDate)) return 5;
  
  const remainingDays = Math.max(1, differenceInDays(dueDate, today));
  const value = (task.estimatedHours * (100 - task.progress)) / (remainingDays * 100);
  
  if (value < 0.1) return 1;
  if (value < 0.5) return 2;
  if (value < 1) return 3;
  if (value < 3) return 4;
  return 5;
};

export const calculateRemainingDays = (dueDate?: Date): number => {
  if (!dueDate) return 0;
  
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  
  if (isAfter(today, due)) return 0;
  
  return differenceInDays(due, today);
};

export const calculateEstimatedHours = (task: Task, allTasks: Task[]): number => {
  if (task.childTaskIds.length === 0) {
    return task.estimatedHours;
  }
  
  return task.childTaskIds.reduce((total, childId) => {
    const childTask = allTasks.find(t => t.id === childId);
    return total + (childTask ? calculateEstimatedHours(childTask, allTasks) : 0);
  }, 0);
};

export const calculateProgress = (task: Task, allTasks: Task[]): number => {
  if (task.childTaskIds.length === 0) {
    return task.progress;
  }
  
  const childTasks = allTasks.filter(t => task.childTaskIds.includes(t.id));
  if (childTasks.length === 0) return 0;
  
  const totalWeightedProgress = childTasks.reduce((total, child) => {
    const childHours = calculateEstimatedHours(child, allTasks);
    return total + (childHours * child.progress);
  }, 0);
  
  const totalHours = calculateEstimatedHours(task, allTasks);
  
  return totalHours > 0 ? Math.round(totalWeightedProgress / totalHours) : 0;
};

export const getTopLevelTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => !task.parentTaskId);
};

export const getChildTasks = (parentId: string, tasks: Task[]): Task[] => {
  return tasks.filter(task => task.parentTaskId === parentId);
};

export const getCompletedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => task.progress === 100);
};

export const getInProgressTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => task.progress > 0 && task.progress < 100);
};

export const getTaskHierarchy = (task: Task, allTasks: Task[], level: number = 0): string => {
  if (level === 0) return task.name;
  return '　'.repeat(level - 1) + task.name;
};
