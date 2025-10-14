import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type ReportData } from "~/types/report";

export const reportRouter = createTRPCRouter({
  getReportData: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }): Promise<ReportData> => {
      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
        include: {
          departments: {
            include: {
              tasks: {
                include: {
                  assignments: {
                    include: {
                      partner: true,
                    },
                  },
                },
              },
            },
          },
          partners: {
            include: {
              departments: {
                include: {
                  department: true,
                },
              },
            },
          },
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Department Data
      const departmentData = company.departments.map((dept) => ({
        name: dept.name,
        weight: dept.weight,
        value: dept.weight, // value seems to be the same as weight in mock data
      }));

      // Partner Tasks
      const partnerTasks = company.partners.map((partner) => ({
        partner: partner.name,
        department: partner.departments.map((d) => d.department.name).join(", "),
        tasks: company.departments.flatMap((dept) =>
          dept.tasks
            .filter((task) =>
              task.assignments.some((a) => a.partnerId === partner.id)
            )
            .map((task) => ({
              name: task.name,
              importance: task.importance,
              weight: task.weight,
            }))
        ),
      }));

      // Detailed Data & Partner Equity
      const detailedData: ReportData['detailedData'] = [];
      const partnerEquityData: ReportData['partnerEquityData'] = [];

      const totalCapital = company.partners.reduce(
        (sum, p) => sum + p.capitalAmount,
        0
      );

      for (const partner of company.partners) {
        const capitalPercent = totalCapital > 0 ? (partner.capitalAmount / totalCapital) * company.capitalWeight : 0;

        let effortEquity = 0;
        for (const dept of company.departments) {
            const totalTaskWeightOfDept = dept.tasks.reduce((sum, t) => sum + t.weight, 0);
            const partnerTasksInDept = dept.tasks.filter(t => t.assignments.some(a => a.partnerId === partner.id));
            const partnerWeightInDept = partnerTasksInDept.reduce((sum, t) => sum + t.weight, 0);

            if (totalTaskWeightOfDept > 0) {
                effortEquity += (partnerWeightInDept / totalTaskWeightOfDept) * dept.weight;
            }
        }
        
        const totalEquity = capitalPercent + effortEquity;

        detailedData.push({
          partner: partner.name,
          department: partner.departments.map((d) => d.department.name).join(", "),
          capitalAmount: partner.capitalAmount,
          capitalPercent: capitalPercent,
          effortEquity: effortEquity,
          totalEquity: totalEquity,
        });

        partnerEquityData.push({
          name: partner.name,
          equity: totalEquity,
          color: '#000000', // Color is not in the database, so using a placeholder
        });
      }

      return {
        departmentData,
        partnerEquityData,
        detailedData,
        partnerTasks,
      };
    }),
});