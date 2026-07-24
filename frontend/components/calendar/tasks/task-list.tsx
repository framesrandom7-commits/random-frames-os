"use client";

import React, { useState } from "react";
import { Prisma, TaskStatus, TaskPriority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, Plus, AlertCircle } from "lucide-react";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: { project: true; client: true; lead: true; assignedTo: true; checklist: true; dependencies: true }
}>;

interface TaskListProps {
  initialTasks: TaskWithRelations[];
  projects: any[];
  clients: any[];
}

export function TaskList({ initialTasks, projects, clients }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  // Group tasks by status
  const pendingTasks = tasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT": return "bg-red-500/20 text-red-500";
      case "HIGH": return "bg-orange-500/20 text-orange-500";
      case "MEDIUM": return "bg-blue-500/20 text-blue-500";
      case "LOW": return "bg-zinc-500/20 text-zinc-400";
      default: return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: TaskStatus) => {
    // Optimistic update
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as TaskStatus } : t));
    
    // In a real app, call Server Action to persist here
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Active Tasks</h2>
          <p className="text-sm text-white/50">{pendingTasks.length} remaining</p>
        </div>
        <Button onClick={() => setIsTaskFormOpen(true)} className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
        
        {/* Pending Tasks */}
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5">
              <CheckCircle2 className="h-8 w-8 mx-auto text-white/20 mb-3" />
              <p className="text-white/50">No active tasks. You're all caught up!</p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTaskCompletion(task.id, task.status)}
                priorityColor={getPriorityColor(task.priority)}
              />
            ))
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Completed</h3>
            <div className="space-y-3 opacity-60">
              {completedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={() => toggleTaskCompletion(task.id, task.status)}
                  priorityColor={getPriorityColor(task.priority)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Task Form Modal Placeholder */}
      {isTaskFormOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Create New Task</h3>
            <p className="text-sm text-white/50 mb-4">Task Form Implementation Goes Here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsTaskFormOpen(false)}>Cancel</Button>
              <Button>Save Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onToggle, priorityColor }: { task: TaskWithRelations, onToggle: () => void, priorityColor: string }) {
  const isCompleted = task.status === "COMPLETED";
  const hasChecklist = task.checklist && task.checklist.length > 0;
  const checklistProgress = hasChecklist ? `${task.checklist.filter(c => c.isCompleted).length}/${task.checklist.length}` : null;

  return (
    <div className={`group flex items-start gap-4 p-4 rounded-xl border transition-all ${isCompleted ? 'bg-white/5 border-transparent' : 'bg-white/10 border-white/10 hover:border-white/20'}`}>
      <button onClick={onToggle} className="mt-1 focus:outline-none">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-white/40 group-hover:text-white hover:fill-white/10 transition-colors" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-base font-medium truncate ${isCompleted ? 'line-through text-white/50' : 'text-white'}`}>
            {task.title}
          </span>
          <Badge variant="outline" className={`ml-auto text-[10px] border-none px-2 py-0 h-5 ${priorityColor}`}>
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-sm text-white/60 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${!isCompleted && new Date(task.dueDate) < new Date() ? 'text-red-400' : ''}`}>
              <Clock className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </div>
          )}
          
          {task.project && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {task.project.title}
            </div>
          )}
          
          {hasChecklist && (
            <div className="flex items-center gap-1 border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
              <CheckCircle2 className="h-3 w-3" />
              {checklistProgress}
            </div>
          )}

          {task.dependencies && task.dependencies.length > 0 && !isCompleted && (
            <div className="flex items-center gap-1 text-orange-400">
              <AlertCircle className="h-3 w-3" />
              {task.dependencies.length} blocker(s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
