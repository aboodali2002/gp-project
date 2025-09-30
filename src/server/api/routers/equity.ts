import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const equityRouter = createTRPCRouter({
  // Calculate complete equity breakdown for a company
  calculateCompanyEquity: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
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

      // Calculate department equity breakdown
      const departmentBreakdown = company.departments.map((dept) => {
        const totalTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
        const equityPerPoint = totalTaskWeight > 0 ? (dept.weight / 100) / totalTaskWeight : 0;

        const taskBreakdown = dept.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          importance: task.importance,
          weight: task.weight,
          equity: task.weight * equityPerPoint,
          equityPercentage: (task.weight * equityPerPoint) * 100,
        }));

        return {
          id: dept.id,
          name: dept.name,
          weight: dept.weight,
          totalTaskWeight,
          equityPerPoint,
          taskBreakdown,
          totalEquity: totalTaskWeight * equityPerPoint,
          totalEquityPercentage: (totalTaskWeight * equityPerPoint) * 100,
          partnerCount: dept.partners.length,
        };
      });

      // Calculate partner equity breakdown
      const totalCompanyCapital = company.partners.reduce((sum, p) => sum + (p as any).capitalAmount || 0, 0);
      const partnerBreakdown = company.partners.map((partner) => {
        // Capital-based equity from amounts
        const share = totalCompanyCapital > 0 ? (((partner as any).capitalAmount || 0) / totalCompanyCapital) : 0;
        const capitalEquity = share * (company.capitalWeight / 100);

        // Effort-based equity
        let effortEquity = 0;
        const departmentContributions = [];

        for (const partnerDept of partner.departments) {
          const dept = partnerDept.department;
          const totalTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
          
          if (totalTaskWeight > 0) {
            const equityPerPoint = (dept.weight / 100) / totalTaskWeight;
            const partnerTaskWeight = dept.tasks.reduce((sum, task) => sum + task.weight, 0);
            const deptContribution = partnerTaskWeight * equityPerPoint;
            effortEquity += deptContribution;

            departmentContributions.push({
              departmentId: dept.id,
              departmentName: dept.name,
              departmentWeight: dept.weight,
              taskWeight: partnerTaskWeight,
              contribution: deptContribution,
              contributionPercentage: deptContribution * 100,
            });
          }
        }

        const totalEquity = capitalEquity + effortEquity;

        return {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          capitalAmount: (partner as any).capitalAmount ?? 0,
          capitalEquity,
          effortEquity,
          totalEquity,
          capitalPercentage: capitalEquity * 100,
          effortPercentage: effortEquity * 100,
          totalPercentage: totalEquity * 100,
          departmentContributions,
        };
      });

      // Calculate validation
      const totalDepartmentWeight = company.departments.reduce((sum, dept) => sum + dept.weight, 0);
      const isDepartmentWeightValid = Math.abs(totalDepartmentWeight - company.effortWeight) < 0.01;
      
      const totalPartnerCapital = totalCompanyCapital;
      const isCapitalValid = totalPartnerCapital > 0;

      return {
        company,
        departmentBreakdown,
        partnerBreakdown,
        validation: {
          isDepartmentWeightValid,
          totalDepartmentWeight,
          expectedDepartmentWeight: company.effortWeight,
          departmentWeightDifference: totalDepartmentWeight - company.effortWeight,
          isCapitalValid,
          totalPartnerCapital,
          capitalExcess: 0,
        },
        summary: {
          totalDepartments: company.departments.length,
          totalPartners: company.partners.length,
          totalTasks: company.departments.reduce((sum, dept) => sum + dept.tasks.length, 0),
          capitalWeight: company.capitalWeight,
          effortWeight: company.effortWeight,
        },
      };
    }),

  // Get vesting schedule for a partner
  getVestingSchedule: publicProcedure
    .input(z.object({ partnerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.partnerId },
        include: {
          company: {
            select: {
              vestingPeriod: true,
              vestingStartDate: true,
              vestingMethod: true,
            },
          },
        },
      });

      if (!partner) return null;

      const { vestingPeriod, vestingStartDate, vestingMethod } = partner.company;
      const startDate = new Date(vestingStartDate);
      
      // Calculate vesting schedule based on method
      const schedule = [];
      const totalShares = 1000000; // This should come from company settings
      const partnerShares = totalShares * (partner.capitalContribution / 100); // Simplified for now

      let currentDate = new Date(startDate);
      let vestedShares = 0;
      let vestingInterval = 1;

      switch (vestingMethod) {
        case "MONTHLY":
          vestingInterval = 1;
          break;
        case "QUARTERLY":
          vestingInterval = 3;
          break;
        case "ANNUAL":
          vestingInterval = 12;
          break;
      }

      for (let month = 0; month <= vestingPeriod; month += vestingInterval) {
        const vestingDate = new Date(startDate);
        vestingDate.setMonth(vestingDate.getMonth() + month);
        
        const vestingPercentage = Math.min((month / vestingPeriod) * 100, 100);
        const sharesThisPeriod = (vestingPercentage / 100) * partnerShares;
        vestedShares = sharesThisPeriod;

        schedule.push({
          date: vestingDate,
          month: month,
          vestingPercentage,
          shares: Math.floor(sharesThisPeriod),
          cumulativeShares: Math.floor(vestedShares),
        });
      }

      return {
        partner,
        vestingPeriod,
        vestingStartDate,
        vestingMethod,
        totalShares,
        partnerShares,
        schedule,
      };
    }),

  // Validate equity allocation
  validateAllocation: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
        include: {
          departments: true,
          partners: true,
        },
      });

      if (!company) return null;

      const totalDepartmentWeight = company.departments.reduce((sum, dept) => sum + dept.weight, 0);
      const totalPartnerCapital = company.partners.reduce((sum, partner) => sum + partner.capitalContribution, 0);

      const errors = [];
      const warnings = [];

      // Check department weights
      if (Math.abs(totalDepartmentWeight - company.effortWeight) > 0.01) {
        errors.push({
          type: "department_weights",
          message: `Department weights total ${totalDepartmentWeight.toFixed(2)}% but should equal ${company.effortWeight}%`,
          current: totalDepartmentWeight,
          expected: company.effortWeight,
          difference: totalDepartmentWeight - company.effortWeight,
        });
      }

      // Check capital contributions
      if (totalPartnerCapital > 100) {
        errors.push({
          type: "capital_excess",
          message: `Total capital contributions (${totalPartnerCapital.toFixed(2)}%) exceed 100%`,
          current: totalPartnerCapital,
          excess: totalPartnerCapital - 100,
        });
      }

      // Check for empty departments
      const emptyDepartments = company.departments.filter(dept => dept.weight === 0);
      if (emptyDepartments.length > 0) {
        warnings.push({
          type: "empty_departments",
          message: `${emptyDepartments.length} department(s) have 0% weight`,
          departments: emptyDepartments.map(dept => ({ id: dept.id, name: dept.name })),
        });
      }

      // Check for partners with no capital or departments
      const inactivePartners = company.partners.filter(
        partner => partner.capitalContribution === 0 && partner.departments.length === 0
      );
      if (inactivePartners.length > 0) {
        warnings.push({
          type: "inactive_partners",
          message: `${inactivePartners.length} partner(s) have no capital contribution or department assignments`,
          partners: inactivePartners.map(partner => ({ id: partner.id, name: partner.name })),
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        summary: {
          totalDepartments: company.departments.length,
          totalPartners: company.partners.length,
          totalDepartmentWeight,
          totalPartnerCapital,
        },
      };
    }),

  // Export equity report
  exportReport: publicProcedure
    .input(z.object({ companyId: z.string(), format: z.enum(["json", "csv"]).default("json") }))
    .query(async ({ ctx, input }) => {
      const equityData = await ctx.db.company.findUnique({
        where: { id: input.companyId },
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

      if (!equityData) return null;

      // Generate report data
      const report = {
        company: {
          name: equityData.name,
          totalShares: equityData.totalShares,
          capitalWeight: equityData.capitalWeight,
          effortWeight: equityData.effortWeight,
          vestingPeriod: equityData.vestingPeriod,
          vestingStartDate: equityData.vestingStartDate,
          vestingMethod: equityData.vestingMethod,
        },
        departments: equityData.departments.map(dept => ({
          name: dept.name,
          weight: dept.weight,
          taskCount: dept.tasks.length,
          partnerCount: dept.partners.length,
        })),
        partners: equityData.partners.map(partner => ({
          name: partner.name,
          email: partner.email,
          capitalContribution: partner.capitalContribution,
        })),
        generatedAt: new Date().toISOString(),
      };

      return {
        format: input.format,
        data: report,
      };
    }),
});
