import { PrismaClient, RoleCode, QuarantineStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CROP COOP database...')

  // ── 1. Seed Roles ────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: RoleCode.SUPER_ADMIN },
      update: {},
      create: {
        code: RoleCode.SUPER_ADMIN,
        name: 'Quản trị hệ thống',
        description: 'Toàn quyền hệ thống',
        permissions: {
          users: { read: true, write: true, delete: true, approve: true },
          diary: { read: true, write: true, delete: true, approve: true },
          inventory: { read: true, write: true, delete: true, approve: true },
          harvest: { read: true, write: true, delete: true, approve: true },
          qrcode: { read: true, write: true, delete: true, approve: true },
          orders: { read: true, write: true, delete: true, approve: true },
          reports: { read: true, write: true },
          config: { read: true, write: true },
        },
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.COOP_ADMIN },
      update: {},
      create: {
        code: RoleCode.COOP_ADMIN,
        name: 'Quản lý HTX',
        description: 'Quản lý toàn bộ hoạt động hợp tác xã',
        permissions: {
          users: { read: true, write: true, delete: false, approve: true },
          diary: { read: true, write: true, delete: false, approve: true },
          inventory: { read: true, write: true, delete: false, approve: true },
          harvest: { read: true, write: true, delete: false, approve: true },
          qrcode: { read: true, write: true, delete: false, approve: true },
          orders: { read: true, write: true, delete: false, approve: true },
          reports: { read: true, write: false },
          config: { read: true, write: false },
        },
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.TECHNICIAN },
      update: {},
      create: {
        code: RoleCode.TECHNICIAN,
        name: 'Kỹ thuật viên',
        description: 'Hỗ trợ kỹ thuật, xác nhận nhật ký',
        permissions: {
          users: { read: true, write: false, delete: false, approve: false },
          diary: { read: true, write: true, delete: false, approve: true },
          inventory: { read: true, write: false, delete: false, approve: false },
          harvest: { read: true, write: true, delete: false, approve: false },
          qrcode: { read: true, write: false, delete: false, approve: false },
          orders: { read: true, write: false, delete: false, approve: false },
          reports: { read: true, write: false },
          config: { read: false, write: false },
        },
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.ACCOUNTANT },
      update: {},
      create: {
        code: RoleCode.ACCOUNTANT,
        name: 'Kế toán',
        description: 'Quản lý tài chính, kho vật tư',
        permissions: {
          users: { read: true, write: false, delete: false, approve: false },
          diary: { read: true, write: false, delete: false, approve: false },
          inventory: { read: true, write: true, delete: false, approve: true },
          harvest: { read: true, write: false, delete: false, approve: false },
          qrcode: { read: true, write: false, delete: false, approve: false },
          orders: { read: true, write: true, delete: false, approve: true },
          reports: { read: true, write: true },
          config: { read: false, write: false },
        },
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.FARMER },
      update: {},
      create: {
        code: RoleCode.FARMER,
        name: 'Nông dân',
        description: 'Ghi nhật ký sản xuất trên lô được phân công',
        permissions: {
          users: { read: false, write: false, delete: false, approve: false },
          diary: { read: true, write: true, delete: false, approve: false },
          inventory: { read: true, write: false, delete: false, approve: false },
          harvest: { read: true, write: false, delete: false, approve: false },
          qrcode: { read: false, write: false, delete: false, approve: false },
          orders: { read: false, write: false, delete: false, approve: false },
          reports: { read: false, write: false },
          config: { read: false, write: false },
        },
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.GUEST },
      update: {},
      create: {
        code: RoleCode.GUEST,
        name: 'Khách',
        description: 'Chỉ xem thông tin công khai',
        permissions: {
          users: { read: false, write: false, delete: false, approve: false },
          diary: { read: false, write: false, delete: false, approve: false },
          inventory: { read: false, write: false, delete: false, approve: false },
          harvest: { read: false, write: false, delete: false, approve: false },
          qrcode: { read: false, write: false, delete: false, approve: false },
          orders: { read: false, write: false, delete: false, approve: false },
          reports: { read: false, write: false },
          config: { read: false, write: false },
        },
      },
    }),
  ])
  console.log(`✅ Seeded ${roles.length} roles`)

  // ── 2. Seed System Config ────────────────────────────────────────────────
  const configs = [
    { key: 'coop_name', value: 'HTX Nông nghiệp Xanh', valueType: 'STRING', group: 'GENERAL', isPublic: true, description: 'Tên hợp tác xã' },
    { key: 'coop_logo_url', value: '/assets/logo.png', valueType: 'STRING', group: 'BRANDING', isPublic: true, description: 'URL logo HTX' },
    { key: 'qr_base_url', value: 'https://cropcoop.vn/trace', valueType: 'STRING', group: 'GENERAL', isPublic: false, description: 'Base URL cho QR truy xuất' },
    { key: 'quarantine_warning_days', value: '3', valueType: 'NUMBER', group: 'QUARANTINE', isPublic: false, description: 'Số ngày trước khi hết cách ly để hiện WARNING' },
    { key: 'max_diary_attachments', value: '10', valueType: 'NUMBER', group: 'GENERAL', isPublic: false, description: 'Số ảnh tối đa mỗi nhật ký' },
    { key: 'offline_sync_interval_minutes', value: '30', valueType: 'NUMBER', group: 'GENERAL', isPublic: false, description: 'Khoảng thời gian sync offline (phút)' },
    { key: 'contact_email', value: 'info@cropcoop.vn', valueType: 'STRING', group: 'GENERAL', isPublic: true, description: 'Email liên hệ HTX' },
    { key: 'contact_phone', value: '1900 xxxx', valueType: 'STRING', group: 'GENERAL', isPublic: true, description: 'Hotline HTX' },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log(`✅ Seeded ${configs.length} system configs`)

  // ── 3. Seed Super Admin User ─────────────────────────────────────────────
  const superAdminRole = roles.find(r => r.code === RoleCode.SUPER_ADMIN)!
  const adminUser = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@cropcoop.vn',
      passwordHash: '$2b$12$PLACEHOLDER_HASH_REPLACE_ON_FIRST_LOGIN', // bcrypt placeholder
      fullName: 'Quản trị viên hệ thống',
      isActive: true,
      userRoles: {
        create: { roleId: superAdminRole.id },
      },
    },
  })
  console.log(`✅ Seeded super admin: ${adminUser.username}`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

