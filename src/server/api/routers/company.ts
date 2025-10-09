import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const companyRouter = createTRPCRouter({
  // Create a new company
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Company name is required"),
        totalShares: z.number().int().positive().default(1000000),
        capitalWeight: z.number().min(0).max(100).default(20),
        vestingPeriod: z.number().int().positive().default(48),
        vestingStartDate: z.date(),
        vestingMethod: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).default("MONTHLY"),
        ownerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const effortWeight = 100 - input.capitalWeight;
      
      return ctx.db.company.create({
        data: {
          name: input.name,
          totalShares: input.totalShares,
          capitalWeight: input.capitalWeight,
          effortWeight: effortWeight,
          vestingPeriod: input.vestingPeriod,
          vestingStartDate: input.vestingStartDate,
          vestingMethod: input.vestingMethod,
          ownerId: input.ownerId,
        },
      });
    }),

  // Get company by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.company.findUnique({
        where: { id: input.id },
        include: {
          departments: {
            include: {
              tasks: true,
              partners: {
                include: {
                  partner: true,
                },
              },
            },
          },
          partners: true,
          owner: true,
        },
      });
    }),

  // Get all companies for a user
  getAllByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.company.findMany({
        where: { ownerId: input.userId },
        include: {
          departments: true,
          partners: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Update company
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        totalShares: z.number().int().positive().optional(),
        capitalWeight: z.number().min(0).max(100).optional(),
        vestingPeriod: z.number().int().positive().optional(),
        vestingStartDate: z.date().optional(),
        vestingMethod: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // If capitalWeight is being updated, recalculate effortWeight
      if (updateData.capitalWeight !== undefined) {
        updateData.effortWeight = 100 - updateData.capitalWeight;
      }

      return ctx.db.company.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete company
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.delete({
        where: { id: input.id },
      });
    }),

  // Get company equity summary
  getEquitySummary: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { id: input.id },
        include: {
          departments: {
            include: {
              tasks: true,
              partners: {
                include: {
                  partner: true,
                },
              },
            },
          },
          partners: true,
        },
      });

      if (!company) return null;

      // Calculate total task weights per department
      const departmentSummaries = company.departments.map((dept) => {
        const totalTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
        const equityPerPoint = totalTaskWeight > 0 ? dept.weight / totalTaskWeight : 0;
        
        return {
          id: dept.id,
          name: dept.name,
          weight: dept.weight,
          totalTaskWeight,
          equityPerPoint,
          taskCount: dept.tasks.length,
          partnerCount: dept.partners.length,
        };
      });

      return {
        company,
        departmentSummaries,
        totalDepartments: company.departments.length,
        totalPartners: company.partners.length,
        totalTasks: company.departments.reduce((sum, dept) => sum + dept.tasks.length, 0),
      };
    }),
});
