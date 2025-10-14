import { PrismaClient, TaskImportance } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a mock user
  const user = await prisma.user.upsert({
    where: { email: 'demo@corporatequota.com' },
    update: {},
    create: {
      email: 'demo@corporatequota.com',
      name: 'Demo User',
    },
  });

  console.log('Created user:', user);

  // Create a mock company
  const company = await prisma.company.upsert({
    where: { name: 'CorporateQuota' },
    update: {},
    create: {
      name: 'CorporateQuota',
      ownerId: user.id,
      vestingStartDate: new Date(),
    },
  });

  console.log('Created company:', company);

  // Create departments
  const departmentData = [
    { name: 'Engineering', weight: 40 },
    { name: 'Marketing', weight: 25 },
    { name: 'Sales', weight: 15 },
    { name: 'Operations', weight: 20 },
  ];

  for (const dept of departmentData) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: {
        name: dept.name,
        weight: dept.weight,
        companyId: company.id,
      },
    });
  }

  console.log('Created departments');

  // Create partners
  const partnerData = [
    { name: 'Mohammed Alojayan', email: 'mohammed@corporatequota.com', capitalAmount: 150 },
    { name: 'Ali Bohulaiqa', email: 'ali@corporatequota.com', capitalAmount: 50 },
    { name: 'Abdullah Alsaeed', email: 'abdullah@corporatequota.com', capitalAmount: 0 },
    { name: 'Mohammed Dhabab', email: 'mohammed.d@corporatequota.com', capitalAmount: 0 },
  ];

  for (const p of partnerData) {
    await prisma.partner.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        capitalAmount: p.capitalAmount,
        companyId: company.id,
      },
    });
  }

  console.log('Created partners');

  // Create tasks and assign them
  const partnerTasks = [
    {
      partnerName: 'Mohammed Alojayan',
      departmentName: 'Engineering',
      tasks: [
        { name: 'Develop API', importance: 'HIGH', weight: 3 },
        { name: 'Database Design', importance: 'MEDIUM', weight: 2 },
        { name: 'Code Review', importance: 'LOW', weight: 1 },
      ],
    },
    {
      partnerName: 'Ali Bohulaiqa',
      departmentName: 'Marketing',
      tasks: [
        { name: 'Market Research', importance: 'HIGH', weight: 3 },
        { name: 'Brand Strategy', importance: 'MEDIUM', weight: 2 },
        { name: 'Social Media', importance: 'LOW', weight: 1 },
      ],
    },
    {
      partnerName: 'Abdullah Alsaeed',
      departmentName: 'Sales',
      tasks: [
        { name: 'Lead Generation', importance: 'HIGH', weight: 3 },
        { name: 'Client Outreach', importance: 'MEDIUM', weight: 2 },
      ],
    },
    {
      partnerName: 'Mohammed Dhabab',
      departmentName: 'Operations',
      tasks: [
        { name: 'Process Documentation', importance: 'MEDIUM', weight: 2 },
        { name: 'Team Coordination', importance: 'HIGH', weight: 3 },
        { name: 'Resource Planning', importance: 'LOW', weight: 1 },
      ],
    },
  ];

  for (const pt of partnerTasks) {
    const partner = await prisma.partner.findFirst({ where: { name: pt.partnerName } });
    const department = await prisma.department.findFirst({ where: { name: pt.departmentName } });

    if (partner && department) {
      for (const task of pt.tasks) {
        const createdTask = await prisma.task.create({
          data: {
            name: task.name,
            importance: task.importance as TaskImportance,
            weight: task.weight,
            departmentId: department.id,
          },
        });

        await prisma.taskAssignment.create({
          data: {
            taskId: createdTask.id,
            partnerId: partner.id,
          },
        });
      }
    }
  }

  console.log('Created tasks and assignments');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });