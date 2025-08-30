import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create agencies
  const abs = await prisma.agency.upsert({
    where: { code: 'ABS' },
    update: {},
    create: {
      code: 'ABS',
      name: 'Australian Bureau of Statistics',
      description: 'Australia\'s official statistical organisation providing trusted official statistics on a wide range of economic, social, population and environmental matters.',
      website: 'https://www.abs.gov.au'
    }
  })

  const aihw = await prisma.agency.upsert({
    where: { code: 'AIHW' },
    update: {},
    create: {
      code: 'AIHW',
      name: 'Australian Institute of Health and Welfare',
      description: 'Australia\'s leading health and welfare statistics and information agency providing authoritative information on Australia\'s health and welfare systems.',
      website: 'https://www.aihw.gov.au'
    }
  })

  const doe = await prisma.agency.upsert({
    where: { code: 'DoE' },
    update: {},
    create: {
      code: 'DoE',
      name: 'Department of Education, Skills and Employment',
      description: 'Leading Australia\'s skills and employment agenda to drive prosperity and opportunity for all Australians.',
      website: 'https://www.dese.gov.au'
    }
  })

  console.log('✅ Agencies created')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: 'labour-market' }, update: {}, create: { name: 'labour-market' } }),
    prisma.tag.upsert({ where: { name: 'aged-care' }, update: {}, create: { name: 'aged-care' } }),
    prisma.tag.upsert({ where: { name: 'workforce' }, update: {}, create: { name: 'workforce' } }),
    prisma.tag.upsert({ where: { name: 'housing' }, update: {}, create: { name: 'housing' } }),
    prisma.tag.upsert({ where: { name: 'population' }, update: {}, create: { name: 'population' } }),
    prisma.tag.upsert({ where: { name: 'education' }, update: {}, create: { name: 'education' } }),
    prisma.tag.upsert({ where: { name: 'skills' }, update: {}, create: { name: 'skills' } }),
    prisma.tag.upsert({ where: { name: 'inequality' }, update: {}, create: { name: 'inequality' } }),
    prisma.tag.upsert({ where: { name: 'ageing' }, update: {}, create: { name: 'ageing' } }),
    prisma.tag.upsert({ where: { name: 'health' }, update: {}, create: { name: 'health' } })
  ])

  console.log('✅ Tags created')

  // Create ABS datasets
  const absDatasets = await Promise.all([
    prisma.dataset.create({
      data: {
        name: 'Labour Force, Australia',
        description: 'Monthly labour force statistics including employment, unemployment, participation rates, and hours worked. Key indicator for economic health and workforce trends.',
        agencyId: abs.id,
        collectionDate: new Date('2024-01-01'),
        frequency: 'monthly',
        accessibility: 'api',
        format: 'API',
        apiEndpoint: 'https://api.data.abs.gov.au/data/ABS_LABOUR_FORCE/M1',
        downloadUrl: 'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia',
        dataPortalUrl: 'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia',
        keywords: JSON.stringify(['employment', 'unemployment', 'labour force', 'participation rate', 'economic indicators', 'workforce trends']),
        domains: JSON.stringify(['labour', 'economy', 'inequality']),
        tags: {
          connect: [
            { name: 'labour-market' },
            { name: 'workforce' }
          ]
        }
      }
    }),
    prisma.dataset.create({
      data: {
        name: 'Census of Population and Housing',
        description: 'Comprehensive count of population and housing characteristics across Australia, conducted every 5 years. Includes demographic, employment, education, and housing data.',
        agencyId: abs.id,
        collectionDate: new Date('2021-08-10'),
        frequency: 'quinquennial',
        accessibility: 'public',
        format: 'data-cube',
        downloadUrl: 'https://www.abs.gov.au/statistics/detailed-data/census',
        dataPortalUrl: 'https://www.abs.gov.au/census',
        keywords: JSON.stringify(['census', 'population', 'housing', 'demographics', 'employment', 'education', 'family composition']),
        domains: JSON.stringify(['population', 'housing', 'labour', 'education']),
        tags: {
          connect: [
            { name: 'population' },
            { name: 'housing' },
            { name: 'education' }
          ]
        }
      }
    }),
    prisma.dataset.create({
      data: {
        name: 'Household Income and Wealth, Australia',
        description: 'Annual survey providing detailed information on household income distribution, wealth, and economic inequality measures.',
        agencyId: abs.id,
        collectionDate: new Date('2023-01-01'),
        frequency: 'annual',
        accessibility: 'public',
        format: 'CSV',
        downloadUrl: 'https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia',
        dataPortalUrl: 'https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia',
        keywords: JSON.stringify(['income', 'wealth', 'inequality', 'households', 'economic distribution', 'poverty', 'gini coefficient']),
        domains: JSON.stringify(['inequality', 'economy', 'housing']),
        tags: {
          connect: [
            { name: 'inequality' },
            { name: 'housing' }
          ]
        }
      }
    })
  ])

  // Create AIHW datasets
  const aihwDatasets = await Promise.all([
    prisma.dataset.create({
      data: {
        name: 'Aged Care Workforce Data',
        description: 'Comprehensive data on aged care workforce including staffing levels, qualifications, turnover rates, and workforce projections.',
        agencyId: aihw.id,
        collectionDate: new Date('2023-06-30'),
        frequency: 'annual',
        accessibility: 'public',
        format: 'CSV',
        downloadUrl: 'https://www.aihw.gov.au/reports/australias-welfare/aged-care-workforce',
        dataPortalUrl: 'https://www.aihw.gov.au/reports/australias-welfare/aged-care-workforce',
        keywords: JSON.stringify(['aged care', 'workforce', 'elderly care', 'nursing', 'carers', 'health workforce', 'ageing population']),
        domains: JSON.stringify(['health', 'ageing', 'labour']),
        tags: {
          connect: [
            { name: 'aged-care' },
            { name: 'workforce' },
            { name: 'ageing' },
            { name: 'health' }
          ]
        }
      }
    }),
    prisma.dataset.create({
      data: {
        name: 'Population Projections, Australia',
        description: 'Projections of Australia\'s population by age, sex, and state/territory to 2071. Essential for planning aged care, housing, and workforce needs.',
        agencyId: aihw.id,
        collectionDate: new Date('2023-01-01'),
        frequency: 'annual',
        accessibility: 'public',
        format: 'Excel',
        downloadUrl: 'https://www.aihw.gov.au/reports/population/population-projections-australia',
        dataPortalUrl: 'https://www.aihw.gov.au/reports/population/population-projections-australia',
        keywords: JSON.stringify(['population projections', 'ageing', 'demographics', 'fertility', 'mortality', 'migration', 'regional population']),
        domains: JSON.stringify(['population', 'ageing', 'health']),
        tags: {
          connect: [
            { name: 'population' },
            { name: 'ageing' }
          ]
        }
      }
    }),
    prisma.dataset.create({
      data: {
        name: 'Housing and Homelessness Data',
        description: 'Specialist homelessness services data, housing assistance programs, and homelessness estimates. Links housing affordability with social services.',
        agencyId: aihw.id,
        collectionDate: new Date('2023-06-30'),
        frequency: 'annual',
        accessibility: 'public',
        format: 'CSV',
        downloadUrl: 'https://www.aihw.gov.au/reports/housing/housing-and-homelessness',
        dataPortalUrl: 'https://www.aihw.gov.au/reports/housing/housing-and-homelessness',
        keywords: JSON.stringify(['homelessness', 'housing assistance', 'social housing', 'affordable housing', 'rental stress', 'homeless services']),
        domains: JSON.stringify(['housing', 'health', 'inequality']),
        tags: {
          connect: [
            { name: 'housing' },
            { name: 'health' },
            { name: 'inequality' }
          ]
        }
      }
    })
  ])

  // Create Department of Education datasets
  const doeDatasets = await Promise.all([
    prisma.dataset.create({
      data: {
        name: 'Skills and Employment Shortages',
        description: 'Annual report on skills shortages across industries and occupations. Identifies priority skills needs and labour market gaps.',
        agencyId: doe.id,
        collectionDate: new Date('2023-12-01'),
        frequency: 'annual',
        accessibility: 'public',
        format: 'PDF',
        downloadUrl: 'https://www.dese.gov.au/skills-and-employment-shortages',
        dataPortalUrl: 'https://www.dese.gov.au/skills-and-employment-shortages',
        keywords: JSON.stringify(['skills shortage', 'occupations', 'labour market', 'training needs', 'workforce planning', 'industry skills']),
        domains: JSON.stringify(['labour', 'education', 'skills']),
        tags: {
          connect: [
            { name: 'skills' },
            { name: 'labour-market' },
            { name: 'workforce' }
          ]
        }
      }
    }),
    prisma.dataset.create({
      data: {
        name: 'Apprenticeships and Traineeships',
        description: 'Data on apprenticeship and traineeship commencements, completions, and employment outcomes. Tracks vocational education and training outcomes.',
        agencyId: doe.id,
        collectionDate: new Date('2023-06-30'),
        frequency: 'quarterly',
        accessibility: 'public',
        format: 'Excel',
        downloadUrl: 'https://www.dese.gov.au/apprenticeships-and-traineeships',
        dataPortalUrl: 'https://www.dese.gov.au/apprenticeships-and-traineeships',
        keywords: JSON.stringify(['apprenticeships', 'traineeships', 'vocational education', 'employment outcomes', 'training completions', 'skilled workforce']),
        domains: JSON.stringify(['education', 'labour', 'skills']),
        tags: {
          connect: [
            { name: 'education' },
            { name: 'skills' },
            { name: 'workforce' }
          ]
        }
      }
    }),
    prisma.dataset.create({
      data: {
        name: 'Higher Education Statistics',
        description: 'Comprehensive data on higher education enrolments, completions, graduate outcomes, and employment destinations.',
        agencyId: doe.id,
        collectionDate: new Date('2023-01-01'),
        frequency: 'annual',
        accessibility: 'public',
        format: 'data-cube',
        downloadUrl: 'https://www.dese.gov.au/higher-education-statistics',
        dataPortalUrl: 'https://www.dese.gov.au/higher-education-statistics',
        keywords: JSON.stringify(['higher education', 'university', 'graduates', 'employment outcomes', 'enrolments', 'qualifications', 'graduate employment']),
        domains: JSON.stringify(['education', 'labour', 'skills']),
        tags: {
          connect: [
            { name: 'education' },
            { name: 'skills' },
            { name: 'workforce' }
          ]
        }
      }
    })
  ])

  console.log('✅ Datasets created')

  // Create dataset relationships
  await Promise.all([
    // ABS Labour Force -> AIHW Aged Care Workforce (feeds into)
    prisma.datasetRelation.create({
      data: {
        fromId: absDatasets[0].id,
        toId: aihwDatasets[0].id,
        relationType: 'feeds-into',
        description: 'Labour force data provides context for aged care workforce planning and projections'
      }
    }),
    // ABS Census -> AIHW Population Projections (related-to)
    prisma.datasetRelation.create({
      data: {
        fromId: absDatasets[1].id,
        toId: aihwDatasets[1].id,
        relationType: 'related-to',
        description: 'Census data forms the baseline for population projections and ageing analysis'
      }
    }),
    // ABS Income Data -> AIHW Housing (related-to)
    prisma.datasetRelation.create({
      data: {
        fromId: absDatasets[2].id,
        toId: aihwDatasets[2].id,
        relationType: 'related-to',
        description: 'Income data helps analyze housing affordability and homelessness patterns'
      }
    }),
    // DoE Skills Shortages -> ABS Labour Force (related-to)
    prisma.datasetRelation.create({
      data: {
        fromId: doeDatasets[0].id,
        toId: absDatasets[0].id,
        relationType: 'related-to',
        description: 'Skills shortage data complements labour force statistics for workforce analysis'
      }
    }),
    // AIHW Aged Care -> DoE Skills Shortages (depends-on)
    prisma.datasetRelation.create({
      data: {
        fromId: aihwDatasets[0].id,
        toId: doeDatasets[0].id,
        relationType: 'depends-on',
        description: 'Aged care workforce needs inform skills shortage identification and training priorities'
      }
    })
  ])

  console.log('✅ Dataset relationships created')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
