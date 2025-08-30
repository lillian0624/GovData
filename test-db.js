const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Testing database connection...')
    const count = await prisma.dataset.count()
    console.log('Total datasets:', count)

    const agencies = await prisma.agency.findMany()
    console.log('Agencies:', agencies.length)

    if (count > 0) {
      const sample = await prisma.dataset.findFirst()
      console.log('Sample dataset:', sample?.name)
      console.log('Sample keywords:', sample?.keywords)
    } else {
      console.log('No datasets found - database might be empty')
    }
  } catch (e) {
    console.error('Database error:', e.message)
    console.error('Error details:', e)
  } finally {
    await prisma.$disconnect()
  }
}

test()
