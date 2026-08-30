import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Task, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubTask: (parentId: string, text: string, priority: Priority, description?: string, dueDate?: string) => void;
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'HIGH': return 'text-red-400 border-red-400/30 bg-red-400/10';
    case 'MEDIUM': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    case 'LOW': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onAddSubTask }) => {
  return (
    <>
    <motion.div
      layout
      role="listitem"
      aria-label={`Objective: ${task.text}, Priority: ${task.priority}, Status: ${task.completed ? 'Completed' : 'Active'}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: task.completed ? [1, 1.02, 1] : [1, 0.98, 1],
        x: task.completed ? 4 : 0,
        backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
        borderColor: task.completed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: task.completed ? ['0 0 0px rgba(16, 185, 129, 0)', '0 0 15px rgba(16, 185, 129, 0.2)', '0 0 0px rgba(16, 185, 129, 0)'] : 'none'
      }}
      transition={{ 
        duration: 0.4,
        scale: { duration: 0.3, ease: "easeOut" },
        x: { type: "spring", stiffness: 300, damping: 25 },
        boxShadow: { duration: 0.8, times: [0, 0.5, 1] }
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-colors mb-3`}
    >
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        aria-pressed={task.completed}
        className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          task.completed 
            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
            : 'border-gray-600 hover:border-cyan-400'
        }`}
      >
        <AnimatePresence>
          {task.completed && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full border-2 border-emerald-400"
              />
              <motion.svg
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                className="w-4 h-4 text-white relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </motion.svg>
            </>
          )}
        </AnimatePresence>
      </button>

      <div className="flex-grow flex flex-col">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ 
              color: task.completed ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
              textDecoration: task.completed ? 'line-through' : 'none'
            }}
            className="text-sm font-medium tracking-wide"
          >
            {task.text}
          </motion.span>
          <div className={`px-1.5 py-0.5 rounded-md border text-[6px] font-bold tracking-[0.1em] uppercase ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </div>
        </div>

        {task.description && (
          <p className={`mt-1 text-[10px] line-clamp-2 leading-relaxed transition-colors ${task.completed ? 'text-gray-700' : 'text-gray-400'}`}>
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <div className={`mt-1.5 flex items-center gap-1.5 text-[8px] font-mono tracking-wider ${task.completed ? 'text-gray-700' : 'text-cyan-500/60'}`}>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>

      <button
        onClick={() => onAddSubTask(task.id, 'New Sub-task', 'MEDIUM')}
        aria-label="Add sub-task"
        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-400 transition-all focus-visible:opacity-100 outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded-lg"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete objective: ${task.text}`}
        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all focus-visible:opacity-100 outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded-lg"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
    {task.subTasks && task.subTasks.length > 0 && (
      <div className="ml-8 mt-2 space-y-2">
        {task.subTasks.map(subTask => (
          <TaskItem
            key={subTask.id}
            task={subTask}
            onToggle={onToggle}
            onDelete={onDelete}
            onAddSubTask={onAddSubTask}
          />
        ))}
      </div>
    )}
    </>
  );
};

export default React.memo(TaskItem);
