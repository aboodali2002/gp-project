import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const partnerRouter = createTRPCRouter({
  // Create a new partner
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Partner name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().optional(),
        gender: z.string().optional(),
        capitalContribution: z.number().min(0).max(100).default(0),
        companyId: z.string(),
        departmentIds: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { departmentIds, ...partnerData } = input;
      
      const partner = await ctx.db.partner.create({
        data: partnerData,
      });

      // Create department associations if provided
      if (departmentIds.length > 0) {
        await ctx.db.partnerDepartment.createMany({
          data: departmentIds.map((deptId) => ({
            partnerId: partner.id,
            departmentId: deptId,
          })),
        });
      }

      return partner;
    }),

  // Get partner by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.partner.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          departments: {
            include: {
              department: {
                include: {
                  tasks: true,
                },
              },
            },
          },
        },
      });
    }),

  // Get all partners for a company
  getAllByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.partner.findMany({
        where: { companyId: input.companyId },
        include: {
          departments: {
            include: {
              department: {
                include: {
                  tasks: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Update partner
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        gender: z.string().optional(),
        capitalContribution: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.partner.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete partner
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partner.delete({
        where: { id: input.id },
      });
    }),

  // Assign partner to department
  assignToDepartment: publicProcedure
    .input(
      z.object({
        partnerId: z.string(),
        departmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partnerDepartment.create({
        data: {
          partnerId: input.partnerId,
          departmentId: input.departmentId,
        },
      });
    }),

  // Remove partner from department
  removeFromDepartment: publicProcedure
    .input(
      z.object({
        partnerId: z.string(),
        departmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partnerDepartment.deleteMany({
        where: {
          partnerId: input.partnerId,
          departmentId: input.departmentId,
        },
      });
    }),

  // Get partner's equity calculation
  getEquityCalculation: publicProcedure
    .input(z.object({ partnerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.partnerId },
        include: {
          company: {
            select: {
              capitalWeight: true,
              effortWeight: true,
            },
          },
          departments: {
            include: {
              department: {
                include: {
                  tasks: true,
                },
              },
            },
          },
        },
      });

      if (!partner) return null;

      // Calculate capital-based equity
      const capitalEquity = (partner.capitalContribution / 100) * (partner.company.capitalWeight / 100);

      // Calculate effort-based equity
      let effortEquity = 0;
      
      for (const partnerDept of partner.departments) {
        const dept = partnerDept.department;
        const totalTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
        
        if (totalTaskWeight > 0) {
          const equityPerPoint = (dept.weight / 100) / totalTaskWeight;
          const partnerTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
          effortEquity += partnerTaskWeight * equityPerPoint;
        }
      }

      const totalEquity = capitalEquity + effortEquity;

      return {
        partner,
        capitalEquity,
        effortEquity,
        totalEquity,
        capitalPercentage: capitalEquity * 100,
        effortPercentage: effortEquity * 100,
        totalPercentage: totalEquity * 100,
      };
    }),

  // Get all partners with their equity calculations
  getAllWithEquity: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const partners = await ctx.db.partner.findMany({
        where: { companyId: input.companyId },
        include: {
          departments: {
            include: {
              department: {
                include: {
                  tasks: true,
                },
              },
            },
          },
        },
      });

      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
        select: {
          capitalWeight: true,
          effortWeight: true,
        },
      });

      if (!company) return [];

      return partners.map((partner) => {
        // Calculate capital-based equity
        const capitalEquity = (partner.capitalContribution / 100) * (company.capitalWeight / 100);

        // Calculate effort-based equity
        let effortEquity = 0;
        
        for (const partnerDept of partner.departments) {
          const dept = partnerDept.department;
          const totalTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
          
          if (totalTaskWeight > 0) {
            const equityPerPoint = (dept.weight / 100) / totalTaskWeight;
            const partnerTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
            effortEquity += partnerTaskWeight * equityPerPoint;
          }
        }

        const totalEquity = capitalEquity + effortEquity;

        return {
          ...partner,
          capitalEquity,
          effortEquity,
          totalEquity,
          capitalPercentage: capitalEquity * 100,
          effortPercentage: effortEquity * 100,
          totalPercentage: totalEquity * 100,
        };
      });
    }),
});
