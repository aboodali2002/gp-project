import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a mock user
  const user = await prisma.user.upsert({
    where: { email: 'demo@corporatequota.com' },
    update: {},
    create: {
      email: 'demo@corporatequota.com',
      name: 'Demo User',
    },
  })

  console.log('Created user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
