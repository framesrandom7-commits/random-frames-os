import { prisma } from "@/lib/prisma";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { TaskStatus, TaskPriority, Prisma } from "@prisma/client";

export class TaskService {
  /**
   * Fetch tasks with relations
   */
  static async getTasks(filters?: {
    projectId?: string;
    clientId?: string;
    leadId?: string;
    assignedToId?: string;
    status?: TaskStatus[];
    priority?: TaskPriority[];
  }) {
    const where: Prisma.TaskWhereInput = {};

    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.leadId) where.leadId = filters.leadId;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.status) where.status = { in: filters.status };
    if (filters?.priority) where.priority = { in: filters.priority };

    return prisma.task.findMany({
      where,
      include: {
        project: true,
        client: true,
        lead: true,
        assignedTo: true,
        checklist: true,
        dependencies: true,
      },
      orderBy: { dueDate: "asc" },
    });
  }

  /**
   * Create a new task
   */
  static async createTask(data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    estimatedDuration?: number;
    projectId?: string;
    clientId?: string;
    leadId?: string;
    assignedToId?: string;
    parentTaskId?: string;
    userId?: string;
  }) {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ?? TaskPriority.MEDIUM,
        dueDate: data.dueDate,
        estimatedDuration: data.estimatedDuration,
        projectId: data.projectId,
        clientId: data.clientId,
        leadId: data.leadId,
        assignedToId: data.assignedToId,
        parentTaskId: data.parentTaskId,
        createdBy: data.userId,
      },
      include: { checklist: true }
    });

    EventBus.publish(WorkflowEvent.TASK_CREATED, {
      taskId: task.id,
      userId: data.userId,
    });

    return task;
  }

  /**
   * Update task status (with dependency checking)
   */
  static async updateTaskStatus(taskId: string, status: TaskStatus, userId?: string) {
    // If completing, check dependencies
    if (status === TaskStatus.COMPLETED) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { dependencies: true }
      });

      if (task?.dependencies?.some(d => d.status !== TaskStatus.COMPLETED)) {
        throw new Error("Cannot complete task until all dependencies are completed.");
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        progress: status === TaskStatus.COMPLETED ? 100 : (status === TaskStatus.IN_PROGRESS ? 50 : 0),
        updatedBy: userId,
      },
    });

    if (status === TaskStatus.COMPLETED) {
      EventBus.publish(WorkflowEvent.TASK_COMPLETED, {
        taskId,
        userId,
      });
    }

    return updated;
  }

  /**
   * Add a checklist item
   */
  static async addChecklistItem(taskId: string, title: string) {
    return prisma.checklistItem.create({
      data: {
        taskId,
        title,
      }
    });
  }

  /**
   * Toggle a checklist item
   */
  static async toggleChecklistItem(itemId: string, isCompleted: boolean) {
    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted }
    });
    
    // Auto-update task progress based on checklist
    const task = await prisma.task.findUnique({
      where: { id: updatedItem.taskId },
      include: { checklist: true }
    });
    
    if (task && task.checklist.length > 0) {
      const completed = task.checklist.filter(c => c.isCompleted).length;
      const progress = Math.round((completed / task.checklist.length) * 100);
      
      await prisma.task.update({
        where: { id: task.id },
        data: {
          progress,
          status: progress === 100 ? TaskStatus.COMPLETED : (progress > 0 ? TaskStatus.IN_PROGRESS : task.status)
        }
      });
      
      if (progress === 100 && task.status !== TaskStatus.COMPLETED) {
        EventBus.publish(WorkflowEvent.TASK_COMPLETED, {
          taskId: task.id,
        });
      }
    }

    return updatedItem;
  }
}
