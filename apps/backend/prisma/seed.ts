import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default departments
  const departments = [
    { name: 'Operations', description: 'Operations department' },
    { name: 'Finance', description: 'Finance department' },
    { name: 'HR', description: 'Human Resources department' },
    { name: 'Support', description: 'Customer support department' },
    { name: 'Technical', description: 'Technical department' },
    { name: 'Management', description: 'Management department' }
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    })
    console.log(`✅ Department ${dept.name} created`)
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash('Busy@123', 12)
  
  const adminUser = await prisma.teamMember.upsert({
    where: { phone: '+233551196764' },
    update: {},
    create: {
      fullName: 'Collins Vidzro',
      phone: '+233551196764',
      email: 'ceo@sendexa.co',
      role: 'manager',
      password: hashedPassword,
      department: {
        connect: { name: 'Operations' }
      }
    }
  })

  console.log('✅ Admin user created:', adminUser.fullName)
  console.log('📧 Email:', adminUser.email)
  console.log('📱 Phone:', adminUser.phone)
  console.log('🔑 Password: Busy@123')
  console.log('🎯 Role:', adminUser.role)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })