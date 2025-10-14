import { postRouter } from "~/server/api/routers/post";
import { companyRouter } from "~/server/api/routers/company";
import { departmentRouter } from "~/server/api/routers/department";
import { partnerRouter } from "~/server/api/routers/partner";
import { taskRouter } from "~/server/api/routers/task";
import { reportRouter } from "~/server/api/routers/report";
import { equityRouter } from "~/server/api/routers/equity";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  company: companyRouter,
  department: departmentRouter,
  partner: partnerRouter,
  task: taskRouter,
  equity: equityRouter,
  report: reportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
