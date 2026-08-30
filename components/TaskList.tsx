import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TaskItem from './TaskItem';
import { Task, Priority } from '../types';

const STORAGE_KEY_SORT_BY = 'nexus_tasks_sortBy';
const STORAGE_KEY_FILTER_STATUS = 'nexus_tasks_filterStatus';
const STORAGE_KEY_FILTER_PRIORITY = 'nexus_tasks_filterPriority';

interface TaskListProps {
  tasks: Task[];
  onAdd: (text: string, priority: Priority, description?: string, dueDate?: string) => void;
  onAddSubTask: (parentId: string, text: string, priority: Priority, description?: string, dueDate?: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAdd, onAddSubTask, onToggle, onDelete }) => {
  const [inputValue, setInputValue] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isDetailed, setIsDetailed] = useState(false);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRIORITY_DESC' | 'PRIORITY_ASC' | 'COMPLETED' | 'ALPHABETICAL'>(() => 
    (localStorage.getItem(STORAGE_KEY_SORT_BY) as any) || 'NEWEST'
  );
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>(() => 
    (localStorage.getItem(STORAGE_KEY_FILTER_STATUS) as any) || 'ALL'
  );
  const [filterPriority, setFilterPriority] = useState<'ALL' | Priority>(() => 
    (localStorage.getItem(STORAGE_KEY_FILTER_PRIORITY) as any) || 'ALL'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SORT_BY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTER_STATUS, filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTER_PRIORITY, filterPriority);
  }, [filterPriority]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onAdd(inputValue, priority, description, dueDate);
    setInputValue('');
    setDescription('');
    setDueDate('');
    setIsDetailed(false);
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = 
      filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && !task.completed) || 
      (filterStatus === 'COMPLETED' && task.completed);
    
    const priorityMatch = 
      filterPriority === 'ALL' || 
      task.priority === filterPriority;

    return statusMatch && priorityMatch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'PRIORITY_DESC') {
      const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return weights[b.priority] - weights[a.priority];
    }
    if (sortBy === 'PRIORITY_ASC') {
      const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return weights[a.priority] - weights[b.priority];
    }
    if (sortBy === 'COMPLETED') {
      return Number(a.completed) - Number(b.completed);
    }
    if (sortBy === 'ALPHABETICAL') {
      return a.text.localeCompare(b.text);
    }
    if (sortBy === 'NEWEST') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'OLDEST') {
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-6 md:mb-8 px-1 md:px-2">
        <div className="flex flex-col">
          <h2 id="tasks-heading" className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase">Neural Objectives</h2>
          <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Synchronize your intent</span>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="sort-tasks" className="sr-only">Sort objectives by</label>
          <select 
            id="sort-tasks"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-[8px] text-blue-400 font-bold uppercase tracking-widest outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="ALPHABETICAL">Alphabetical (A-Z)</option>
            <option value="PRIORITY_DESC">Priority (High to Low)</option>
            <option value="PRIORITY_ASC">Priority (Low to High)</option>
            <option value="COMPLETED">Status</option>
          </select>
          <div className="text-[10px] text-blue-400 font-mono" aria-live="polite" aria-label={`${tasks.filter(t => t.completed).length} of ${tasks.length} objectives completed`}>
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="space-y-4 mb-6 md:mb-8" aria-labelledby="tasks-heading">
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <label htmlFor="new-task-input" className="sr-only">Objective Title</label>
            <input
              id="new-task-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Objective Title..."
              required
              aria-required="true"
              aria-describedby="priority-desc"
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/30 transition-all font-medium"
            />
            {!isDetailed && (
              <button
                type="submit"
                aria-label="Quick Add Objective"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-white"
              >
                <span aria-hidden="true">+</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {isDetailed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="space-y-1">
                  <label htmlFor="task-description" className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Detailed Description</label>
                  <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed instructions or context..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-gray-700 outline-none focus:border-blue-500/30 transition-all resize-none h-20 scrollbar-hide"
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <label htmlFor="task-due-date" className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Due Date</label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-blue-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Priority Signal</label>
                    <div className="flex gap-1" role="radiogroup" aria-label="Select priority">
                      {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 rounded-xl border text-[7px] font-bold tracking-tighter transition-all ${
                            priority === p 
                              ? p === 'HIGH' ? 'bg-red-500/20 border-red-500/50 text-red-400' : p === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                              : 'bg-white/5 border-white/5 text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Synchronize Intent
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setIsDetailed(!isDetailed)}
            className="text-[8px] uppercase tracking-wider text-blue-400/70 hover:text-blue-400 transition-colors flex items-center gap-1 mx-auto"
          >
            {isDetailed ? 'Collapse Detail' : 'Add Detail & Context'}
            <span className={`transition-transform duration-300 ${isDetailed ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>

        {!isDetailed && (
          <div className="space-y-2">
            <span id="priority-desc" className="sr-only">Select priority level for the new objective</span>
            <div className="flex gap-2 px-1" role="radiogroup" aria-labelledby="priority-desc">
              {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={priority === p}
                  tabIndex={priority === p ? 0 : -1}
                  onClick={() => setPriority(p)}
                  onKeyDown={(e) => {
                    const priorities: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
                    const currentIndex = priorities.indexOf(p);
                    let nextIndex;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      nextIndex = (currentIndex + 1) % priorities.length;
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      nextIndex = (currentIndex - 1 + priorities.length) % priorities.length;
                    } else {
                      return;
                    }
                    e.preventDefault();
                    const nextPriority = priorities[nextIndex];
                    setPriority(nextPriority);
                    // Use a small timeout to ensure state update doesn't interfere with focus
                    setTimeout(() => {
                      const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
                      buttons?.[nextIndex]?.focus();
                    }, 0);
                  }}
                  className={`flex-1 py-1.5 rounded-lg border text-[8px] font-bold tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-white outline-none ${
                    priority === p 
                      ? p === 'HIGH' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : p === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6 px-1" role="group" aria-labelledby="filter-label">
        <div className="flex items-center justify-between">
          <span id="filter-label" className="text-[7px] uppercase tracking-[0.2em] text-gray-500 font-bold">Filter Resonance</span>
          <button 
            onClick={() => { setFilterStatus('ALL'); setFilterPriority('ALL'); }}
            aria-label="Reset all filters"
            className="text-[7px] uppercase tracking-[0.2em] text-cyan-500/60 hover:text-cyan-400 transition-colors focus-visible:underline outline-none"
          >
            Reset
          </button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex bg-white/5 rounded-xl p-1 border border-white/5" role="radiogroup" aria-label="Filter by status">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={filterStatus === s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 py-1 rounded-lg text-[7px] font-bold tracking-widest transition-all outline-none focus-visible:bg-white/20 ${
                  filterStatus === s ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex-1 flex bg-white/5 rounded-xl p-1 border border-white/5" role="radiogroup" aria-label="Filter by priority">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <button
                key={p}
                role="radio"
                aria-checked={filterPriority === p}
                onClick={() => setFilterPriority(p)}
                className={`flex-1 py-1 rounded-lg text-[7px] font-bold tracking-widest transition-all outline-none focus-visible:bg-white/20 ${
                  filterPriority === p ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {p === 'ALL' ? 'ALL' : p[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-hide pr-1" role="list" aria-label="Objectives list">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">No active neural threads</p>
            </motion.div>
          ) : (
            sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onAddSubTask={onAddSubTask}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(TaskList);
