import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const departmentRouter = createTRPCRouter({
  // Create a new department
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Department name is required"),
        weight: z.number().min(0).max(100, "Weight must be between 0 and 100"),
        description: z.string().optional(),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.department.create({
        data: {
          name: input.name,
          weight: input.weight,
          description: input.description,
          companyId: input.companyId,
        },
      });
    }),

  // Get department by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.department.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          tasks: true,
          partners: {
            include: {
              partner: true,
            },
          },
        },
      });
    }),

  // Get all departments for a company
  getAllByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.department.findMany({
        where: { companyId: input.companyId },
        include: {
          tasks: true,
          partners: {
            include: {
              partner: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Update department
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        weight: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.department.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete department
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.department.delete({
        where: { id: input.id },
      });
    }),

  // Validate department weights for a company
  validateWeights: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
        select: { effortWeight: true },
      });

      const departments = await ctx.db.department.findMany({
        where: { companyId: input.companyId },
        select: { id: true, name: true, weight: true },
      });

      const totalWeight = departments.reduce((sum, dept) => sum + dept.weight, 0);
      const expectedWeight = company?.effortWeight ?? 80;
      const isValid = Math.abs(totalWeight - expectedWeight) < 0.01; // Allow for small floating point differences

      return {
        isValid,
        totalWeight,
        expectedWeight,
        difference: totalWeight - expectedWeight,
        departments: departments.map((dept) => ({
          id: dept.id,
          name: dept.name,
          weight: dept.weight,
        })),
      };
    }),

  // Move department to different company
  moveToCompany: publicProcedure
    .input(
      z.object({
        departmentId: z.string(),
        newCompanyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.department.update({
        where: { id: input.departmentId },
        data: { companyId: input.newCompanyId },
      });
    }),
});
