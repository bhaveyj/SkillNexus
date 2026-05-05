import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BACKFILL_CREDITS = 50
const BACKFILL_SOURCE = 'backfill-2026-05-05'

async function main() {
  const usersToGrant = await prisma.user.findMany({
    where: {
      creditTransactions: {
        none: { source: BACKFILL_SOURCE },
      },
    },
    select: { id: true, creditBalance: true },
  })

  let granted = 0
  for (const user of usersToGrant) {
    const newBalance = user.creditBalance + BACKFILL_CREDITS
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { creditBalance: newBalance },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: BACKFILL_CREDITS,
          type: 'ONBOARDING',
          source: BACKFILL_SOURCE,
          balanceAfter: newBalance,
        },
      }),
    ])
    granted += 1
  }

  console.log({ backfillSource: BACKFILL_SOURCE, usersGranted: granted })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
