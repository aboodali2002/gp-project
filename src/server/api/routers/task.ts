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

  // Assign task to partner
  assignToPartner: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        partnerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.taskAssignment.create({
        data: {
          taskId: input.taskId,
          partnerId: input.partnerId,
        },
      });
    }),

  // Remove task assignment from partner
  unassignFromPartner: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        partnerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.taskAssignment.delete({
        where: {
          taskId_partnerId: {
            taskId: input.taskId,
            partnerId: input.partnerId,
          },
        },
      });
    }),

  // Get task assignments for a partner
  getPartnerAssignments: publicProcedure
    .input(z.object({ partnerId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.taskAssignment.findMany({
        where: { partnerId: input.partnerId },
        include: {
          task: {
            include: {
              department: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get partners assigned to a task
  getTaskAssignments: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.taskAssignment.findMany({
        where: { taskId: input.taskId },
        include: {
          partner: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Calculate partner effort based on assigned tasks
  calculatePartnerEffort: publicProcedure
    .input(z.object({ partnerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.partnerId },
        include: {
          taskAssignments: {
            include: {
              task: {
                include: {
                  department: true,
                },
              },
            },
          },
          company: {
            select: {
              effortWeight: true,
            },
          },
        },
      });

      if (!partner) return null;

      // Group tasks by department
      const departmentTasks = new Map<string, any[]>();
      partner.taskAssignments.forEach((assignment) => {
        const deptId = assignment.task.department.id;
        if (!departmentTasks.has(deptId)) {
          departmentTasks.set(deptId, []);
        }
        departmentTasks.get(deptId)!.push(assignment.task);
      });

      const effortBreakdown = Array.from(departmentTasks.entries()).map(([deptId, tasks]) => {
        const department = tasks[0]?.department;
        if (!department) return null;

        const totalTaskWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
        const departmentWeight = department.weight;
        const effortContribution = (totalTaskWeight / 100) * (departmentWeight / 100);

        return {
          departmentId: deptId,
          departmentName: department.name,
          departmentWeight,
          taskCount: tasks.length,
          totalTaskWeight,
          effortContribution,
          effortPercentage: effortContribution * 100,
          tasks: tasks.map((task) => ({
            id: task.id,
            name: task.name,
            weight: task.weight,
            importance: task.importance,
          })),
        };
      }).filter(Boolean);

      const totalEffort = effortBreakdown.reduce((sum, dept) => sum + (dept?.effortContribution || 0), 0);

      return {
        partner: {
          id: partner.id,
          name: partner.name,
          email: partner.email,
        },
        totalEffort,
        totalEffortPercentage: totalEffort * 100,
        effortBreakdown,
        companyEffortWeight: partner.company.effortWeight,
      };
    }),
});
