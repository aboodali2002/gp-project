import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // Create a new task
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Task name is required"),
        description: z.string().optional(),
        importance: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
        departmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate weight based on importance
      const weightMap = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      const weight = weightMap[input.importance];

      return ctx.db.task.create({
        data: {
          name: input.name,
          description: input.description,
          importance: input.importance,
          weight: weight,
          departmentId: input.departmentId,
        },
      });
    }),

  // Get task by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: { id: input.id },
        include: {
          department: {
            include: {
              company: true,
            },
          },
        },
      });
    }),

  // Get all tasks for a department
  getAllByDepartment: publicProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: { departmentId: input.departmentId },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Get all tasks for a company
  getAllByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          department: {
            companyId: input.companyId,
          },
        },
        include: {
          department: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Update task
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        importance: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Recalculate weight if importance is being updated
      if (updateData.importance) {
        const weightMap = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        updateData.weight = weightMap[updateData.importance];
      }

      return ctx.db.task.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete task
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: { id: input.id },
      });
    }),

  // Move task to different department
  moveToDepartment: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        newDepartmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: { id: input.taskId },
        data: { departmentId: input.newDepartmentId },
      });
    }),

  // Get task equity calculation
  getEquityCalculation: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        include: {
          department: {
            include: {
              company: {
                select: {
                  effortWeight: true,
                },
              },
              tasks: true,
            },
          },
        },
      });

      if (!task) return null;

      const totalTaskWeight = task.department.tasks.reduce((sum, t) => sum + t.weight, 0);
      const equityPerPoint = totalTaskWeight > 0 ? (task.department.weight / 100) / totalTaskWeight : 0;
      const taskEquity = task.weight * equityPerPoint;

      return {
        task,
        totalTaskWeight,
        equityPerPoint,
        taskEquity,
        taskEquityPercentage: taskEquity * 100,
        departmentWeight: task.department.weight,
      };
    }),

  // Get department task summary
  getDepartmentTaskSummary: publicProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const department = await ctx.db.department.findUnique({
        where: { id: input.departmentId },
        include: {
          tasks: true,
          company: {
            select: {
              effortWeight: true,
            },
          },
        },
      });

      if (!department) return null;

      const totalTaskWeight = department.tasks.reduce((sum, task) => sum + task.weight, 0);
      const equityPerPoint = totalTaskWeight > 0 ? (department.weight / 100) / totalTaskWeight : 0;

      const taskSummary = department.tasks.map((task) => ({
        id: task.id,
        name: task.name,
        importance: task.importance,
        weight: task.weight,
        equity: task.weight * equityPerPoint,
        equityPercentage: (task.weight * equityPerPoint) * 100,
      }));

      return {
        department,
        totalTaskWeight,
        equityPerPoint,
        taskSummary,
        totalEquity: totalTaskWeight * equityPerPoint,
        totalEquityPercentage: (totalTaskWeight * equityPerPoint) * 100,
      };
    }),

  // Bulk create tasks
  createBulk: publicProcedure
    .input(
      z.object({
        tasks: z.array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            importance: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
          })
        ),
        departmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const weightMap = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      
      const tasksData = input.tasks.map((task) => ({
        name: task.name,
        description: task.description,
        importance: task.importance,
        weight: weightMap[task.importance],
        departmentId: input.departmentId,
      }));

      return ctx.db.task.createMany({
        data: tasksData,
      });
    }),
});
