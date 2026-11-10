import { PrismaClient, RoleCode, LivestockType, HerdStatus, MaterialType, HealthCondition, MovementType, QrStatus, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu Hệ thống HTX Chăn nuôi Minh Trung (Tây Ninh)...')

  // 1. Vai trò (Roles)
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: RoleCode.SUPER_ADMIN },
      update: {},
      create: {
        code: RoleCode.SUPER_ADMIN,
        name: 'Quản trị hệ thống',
        description: 'Toàn quyền cấu hình và giám sát',
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.COOP_ADMIN },
      update: {},
      create: {
        code: RoleCode.COOP_ADMIN,
        name: 'Ban Quản trị HTX',
        description: 'Quản lý thành viên, điều phối nguồn lực, hợp đồng bao tiêu',
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.VETERINARIAN },
      update: {},
      create: {
        code: RoleCode.VETERINARIAN,
        name: 'Cán bộ Thú y & Kỹ thuật',
        description: 'Lập lịch tiêm phòng, giám sát sức khỏe, phác đồ điều trị, kiểm soát ngưng thuốc',
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.ACCOUNTANT },
      update: {},
      create: {
        code: RoleCode.ACCOUNTANT,
        name: 'Kế toán & Thủ kho',
        description: 'Quản lý kho thức ăn, thuốc thú y, thanh toán và hạch toán chi phí',
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.FARMER_HOUSEHOLD },
      update: {},
      create: {
        code: RoleCode.FARMER_HOUSEHOLD,
        name: 'Hộ chăn nuôi thành viên',
        description: 'Ghi nhật ký thức ăn, tăng trưởng, báo dịch bệnh và nhận lịch dịch vụ',
      },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.BUYER },
      update: {},
      create: {
        code: RoleCode.BUYER,
        name: 'Khách hàng / Thương lái tiêu thụ',
        description: 'Đặt hàng, ký hợp đồng bao tiêu, tra cứu nguồn gốc sản phẩm',
      },
    }),
  ])
  console.log(`✅ Đã tạo ${roles.length} vai trò.`)

  // 2. Tài khoản quản trị & Cán bộ thú y
  const coopAdmin = await prisma.user.upsert({
    where: { username: 'admin_minhtrung' },
    update: {},
    create: {
      username: 'admin_minhtrung',
      email: 'bqt@htxminhtrung.vn',
      passwordHash: '$2b$12$e8x/yUvB1Q31.pT4kG3J.eQz5i0x9vGqVvQoB8F8QjGg7iV4qX0C2',
      fullName: 'Ông Nguyễn Minh Trung (Chủ tịch HTX)',
      phone: '0918123456',
      roles: { create: { roleId: roles.find(r => r.code === RoleCode.COOP_ADMIN)!.id } },
    },
  })

  const vetUser = await prisma.user.upsert({
    where: { username: 'thuy_tranvan' },
    update: {},
    create: {
      username: 'thuy_tranvan',
      email: 'thuy.tran@htxminhtrung.vn',
      passwordHash: '$2b$12$e8x/yUvB1Q31.pT4kG3J.eQz5i0x9vGqVvQoB8F8QjGg7iV4qX0C2',
      fullName: 'Bác sĩ thú y Trần Văn An',
      phone: '0977889900',
      roles: { create: { roleId: roles.find(r => r.code === RoleCode.VETERINARIAN)!.id } },
    },
  })

  // 3. Hộ chăn nuôi thành viên
  const farmerUser1 = await prisma.user.upsert({
    where: { username: 'ho_bathanh' },
    update: {},
    create: {
      username: 'ho_bathanh',
      email: 'bathanh@gmail.com',
      passwordHash: '$2b$12$e8x/yUvB1Q31.pT4kG3J.eQz5i0x9vGqVvQoB8F8QjGg7iV4qX0C2',
      fullName: 'Nguyễn Văn Thành (Hộ Ba Thành)',
      phone: '0903112233',
      roles: { create: { roleId: roles.find(r => r.code === RoleCode.FARMER_HOUSEHOLD)!.id } },
    },
  })

  const household1 = await prisma.farmerHousehold.upsert({
    where: { userId: farmerUser1.id },
    update: {},
    create: {
      userId: farmerUser1.id,
      householdCode: 'HCN-MT-001',
      householderName: 'Nguyễn Văn Thành',
      nationalId: '072085001234',
      phone: '0903112233',
      address: 'Số 11/181 ĐT.785, tổ 21, ấp Tân Trung B',
      commune: 'Xã Tân Phú',
      district: 'Huyện Tân Châu',
      province: 'Tây Ninh',
      farmLatitude: 11.458231,
      farmLongitude: 106.128742,
      capacityHead: 300,
      bioSecurityCert: 'VietGAHP-CN-2025-089',
      certIssueDate: new Date('2025-01-15'),
    },
  })

  // Chuồng nuôi của hộ 1
  const barn1 = await prisma.barn.upsert({
    where: { householdId_barnCode: { householdId: household1.id, barnCode: 'CH-01' } },
    update: {},
    create: {
      householdId: household1.id,
      barnCode: 'CH-01',
      name: 'Chuồng heo thịt số 1 (Công nghệ kín, quạt hút)',
      areaM2: 250,
      maxCapacity: 120,
      currentStock: 100,
    },
  })

  // 4. Giống vật nuôi (Breeds)
  const pigBreed = await prisma.breed.upsert({
    where: { breedCode: 'HEO-DUROC-F1' },
    update: {},
    create: {
      breedCode: 'HEO-DUROC-F1',
      name: 'Heo thịt thương phẩm (Duroc x Landrace/Yorkshire)',
      type: LivestockType.PIG,
      origin: 'Trung tâm Giống Chăn nuôi Tây Ninh',
      standardGrowthDays: 125,
      targetWeightKg: 105.0,
      description: 'Kháng bệnh tốt, tăng trọng nhanh, tỷ lệ nạc cao 60-62%',
    },
  })

  // 5. Đàn vật nuôi (Herd Batch)
  const herd1 = await prisma.herdBatch.upsert({
    where: { batchCode: 'DAN-2026-HEO-01' },
    update: {},
    create: {
      batchCode: 'DAN-2026-HEO-01',
      householdId: household1.id,
      barnId: barn1.id,
      breedId: pigBreed.id,
      createdById: coopAdmin.id,
      animalType: LivestockType.PIG,
      initialQuantity: 100,
      currentQuantity: 98,
      deadQuantity: 2,
      soldQuantity: 0,
      entryDate: new Date('2026-08-01'),
      expectedExitDate: new Date('2026-12-05'),
      avgEntryWeightKg: 18.5,
      avgCurrentWeightKg: 95.0,
      supplierName: 'Trại giống An Bình - Tây Ninh',
      quarantineCertNo: 'KD-GIONG-TN-2026/891',
      status: HerdStatus.RAISING,
      lastMedicineDate: new Date('2026-10-15'),
      requiredWithdrawalDays: 14,
      safeHarvestDate: new Date('2026-10-29'),
      notes: 'Đàn phát triển đồng đều, tiêm phòng đầy đủ theo quy trình VietGAHP',
    },
  })

  // 6. Vật tư: Thức ăn, Thuốc thú y, Vắc-xin
  const feedMaterial = await prisma.material.upsert({
    where: { code: 'TA-DEHEUS-552' },
    update: {},
    create: {
      code: 'TA-DEHEUS-552',
      name: 'Cám hỗn hợp De Heus 552 (Heo thịt 30-60kg)',
      type: MaterialType.FEED,
      unit: 'bao 25kg',
      manufacturer: 'De Heus Việt Nam',
      currentStock: 250,
      unitPrice: 345000,
      withdrawalDays: 0,
    },
  })

  const vaccineDichTa = await prisma.material.upsert({
    where: { code: 'VAX-CSFV-NAVET' },
    update: {},
    create: {
      code: 'VAX-CSFV-NAVET',
      name: 'Vắc-xin Dịch tả lợn nhược độc (Navetco)',
      type: MaterialType.VACCINE,
      unit: 'lọ 20 liều',
      manufacturer: 'Công ty Thuốc thú y Navetco',
      currentStock: 50,
      unitPrice: 180000,
      withdrawalDays: 0,
    },
  })

  const medicineAmox = await prisma.material.upsert({
    where: { code: 'MED-AMOX-10' },
    update: {},
    create: {
      code: 'MED-AMOX-10',
      name: 'Amoxicillin 10% bột uống điều trị tiêu chảy, hô hấp',
      type: MaterialType.VET_MEDICINE,
      unit: 'gói 1kg',
      manufacturer: 'Công ty Marphavet',
      currentStock: 20,
      unitPrice: 220000,
      withdrawalDays: 14, // Bắt buộc ngưng thuốc 14 ngày trước xuất chuồng
      activeIngredient: 'Amoxicillin Trihydrate',
    },
  })

  // 7. Lịch tiêm phòng & Khử trùng
  await prisma.vaccinationSchedule.createMany({
    data: [
      {
        herdId: herd1.id,
        materialId: vaccineDichTa.id,
        title: 'Tiêm phòng Vắc-xin Dịch tả lợn lần 1',
        targetAgeDays: 35,
        scheduledDate: new Date('2026-08-15'),
        executedDate: new Date('2026-08-15'),
        dosagePerHead: '2ml / con',
        administeredBy: 'BSTY. Trần Văn An',
        isCompleted: true,
        notes: 'Tiêm 100 con, sức khỏe sau tiêm ổn định',
      },
      {
        herdId: herd1.id,
        title: 'Phun khử trùng tiêu độc chuồng trại định kỳ đợt 4',
        targetAgeDays: 70,
        scheduledDate: new Date('2026-09-20'),
        executedDate: new Date('2026-09-20'),
        dosagePerHead: 'Phun toàn bộ chuồng C01',
        administeredBy: 'Hộ Ba Thành',
        isCompleted: true,
      },
    ],
    skipDuplicates: true,
  })

  // 8. Nhật ký tăng trưởng & FCR
  await prisma.growthLog.createMany({
    data: [
      {
        herdId: herd1.id,
        recordDate: new Date('2026-08-30'),
        daysOfAge: 45,
        sampleCount: 15,
        avgWeightKg: 32.5,
        minWeightKg: 29.0,
        maxWeightKg: 36.0,
        dailyGainGram: 720.0,
        calculatedFCR: 2.25,
        recordedBy: 'Nguyễn Văn Thành',
      },
      {
        herdId: herd1.id,
        recordDate: new Date('2026-09-30'),
        daysOfAge: 75,
        sampleCount: 20,
        avgWeightKg: 62.0,
        minWeightKg: 58.0,
        maxWeightKg: 66.5,
        dailyGainGram: 880.0,
        calculatedFCR: 2.38,
        recordedBy: 'Nguyễn Văn Thành',
      },
    ],
    skipDuplicates: true,
  })

  // 9. Theo dõi sức khỏe & Điều trị
  const healthRec = await prisma.healthLog.create({
    data: {
      herdId: herd1.id,
      reportedDate: new Date('2026-10-10'),
      affectedCount: 3,
      condition: HealthCondition.TREATED,
      symptoms: 'Có 3 cá thể bỏ ăn nhẹ, ho hen vào buổi sáng sớm',
      diagnosis: 'Nhiễm khuẩn hô hấp do thay đổi thời tiết',
      isolationRoom: 'Ngăn cách ly góc chuồng C01',
      vetDoctorId: vetUser.id,
      notes: 'Đã tiêm Amoxicillin 3 ngày, vật nuôi đã ăn uống bình thường trở lại',
      treatments: {
        create: {
          materialId: medicineAmox.id,
          dosage: '1g / 10kg thể trọng',
          startDate: new Date('2026-10-10'),
          endDate: new Date('2026-10-13'),
          withdrawalDays: 14,
        },
      },
    },
  })

  // 10. Truy xuất nguồn gốc QR Code (Hộ chiếu vật nuôi số)
  await prisma.animalTraceQR.upsert({
    where: { token: 'TRACE-PIG-2026-MT01' },
    update: {},
    create: {
      herdId: herd1.id,
      token: 'TRACE-PIG-2026-MT01',
      productBatchCode: 'THIT-HEO-SACH-MT-01',
      status: QrStatus.ACTIVE,
      conditionVaccinationOk: true,
      conditionWithdrawalOk: true,
      conditionVetCheckedOk: true,
      publicUrl: 'https://trace.cropcoop.vn/livestock/TRACE-PIG-2026-MT01',
      qrImageUrl: '/qr/pig-trace-mt01.png',
      snapshotData: {
        household: 'Hộ Ba Thành (HCN-MT-001) - Xã Tân Phú, Tây Ninh',
        breed: 'Heo thịt F1 Duroc',
        feedSupplier: 'Cám De Heus chứng nhận không kích thích tăng trọng',
        vaccineCoverage: '100% tiêm phòng Dịch tả, Lở mồm long móng, Tai xanh',
        withdrawalStatus: 'Đã hoàn tất cách ly ngưng kháng sinh 16 ngày (an toàn tuyệt đối)',
      },
    },
  })

  // 11. Hợp đồng bao tiêu & Đơn hàng
  const contract = await prisma.contract.upsert({
    where: { contractNo: 'HD-BAOTIEU-VISSAN-2026' },
    update: {},
    create: {
      contractNo: 'HD-BAOTIEU-VISSAN-2026',
      householdId: household1.id,
      buyerName: 'Công ty Cổ phần Việt Nam Kỹ Nghệ Súc Sản (VISSAN)',
      buyerPhone: '02838556677',
      contractType: 'BAO_TIEU_DAU_RA',
      signedDate: new Date('2026-07-01'),
      expiryDate: new Date('2026-12-31'),
      committedQtyHead: 100,
      contractValue: 620000000,
      status: 'ACTIVE',
    },
  })

  await prisma.order.upsert({
    where: { orderNo: 'DH-VISSAN-01' },
    update: {},
    create: {
      orderNo: 'DH-VISSAN-01',
      contractId: contract.id,
      customerName: 'Chi nhánh Thu mua Vissan Tây Ninh',
      customerPhone: '0908889911',
      customerAddress: 'Khu Công Nghiệp Trảng Bàng, Tây Ninh',
      totalAmount: 312000000,
      status: OrderStatus.CONFIRMED,
      deliveryDate: new Date('2026-12-05'),
      notes: 'Xuất 50 con heo thịt đạt chuẩn trọng lượng 100-105kg/con',
    },
  })

  // 12. Tổng hợp Chi phí & Hiệu quả kinh tế
  await prisma.costProfitSummary.upsert({
    where: { herdId: herd1.id },
    update: {},
    create: {
      herdId: herd1.id,
      breedCost: 160000000,     // 100 con x 1.6 tr/con
      feedCost: 245000000,      // Tiền cám De Heus
      vetCost: 18500000,        // Vắc-xin & thuốc bổ trợ
      laborCost: 35000000,      // Công chăm sóc
      otherCost: 12000000,      // Điện nước, khấu hao
      totalCost: 470500000,
      totalWeightSoldKg: 9800,  // 98 con x 100kg
      totalRevenue: 607600000,  // Giá 62.000 đ/kg
      netProfit: 137100000,     // Lợi nhuận ròng
      finalFCR: 2.42,
      survivalRate: 98.0,
      profitPerHead: 1398979,   // ~1.4 triệu / con
    },
  })

  console.log('🎉 Nạp dữ liệu mẫu HTX Chăn nuôi thành công rực rỡ!')
}

main()
  .catch((e) => {
    console.error('Lỗi seed dữ liệu:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
