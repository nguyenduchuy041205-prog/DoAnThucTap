# HTX CHĂN NUÔI MINH TRUNG (TÂY NINH) — HỆ THỐNG QUẢN LÝ CHUYỂN ĐỔI SỐ

> Đồ án thực tập: Hệ thống Quản trị HTX Chăn nuôi Tập thể & Hộ chiếu Truy xuất Nguồn gốc Số (Digital Livestock Passport)  
> Đơn vị áp dụng: **Hợp tác xã Dịch vụ Nông nghiệp Minh Trung** (Tân Phú, Tân Châu, Tây Ninh)  
> Nghiên cứu thuộc đề tài KH&CN: *“Giải pháp thúc đẩy hoạt động chuyển đổi số trong các HTX nông nghiệp trên địa bàn tỉnh Tây Ninh”*

---

## 🌟 10 Phân Hệ Nghiệp Vụ Cốt Lõi

1. **Quản lý thành viên và hộ chăn nuôi**:
   - Định danh hộ chăn nuôi (Mã hộ `HCN-MT-xxx`), chủ hộ, số CCCD, địa chỉ, vị trí GPS trang trại, quy mô sức chứa (con).
   - Quản lý giấy chứng nhận an toàn sinh học VietGAHP, chuồng trại nội bộ.
2. **Quản lý đàn, nhóm vật nuôi và nguồn giống**:
   - Quản lý theo mã đàn (`DAN-2026-xxx`), giống vật nuôi (Heo Duroc F1, Bò 3B Blanc Bleu Belge, Gà thả vườn...).
   - Theo dõi nguồn gốc cơ sở con giống, giấy kiểm dịch nhập giống, trọng lượng bình quân và mục tiêu xuất chuồng.
3. **Theo dõi quá trình chăm sóc và tăng trưởng**:
   - Nhật ký cân đo định kỳ theo ngày tuổi, tính toán tốc độ tăng trọng bình quân ngày (ADG - Average Daily Gain).
   - Tự động tính toán và cảnh báo hệ số chuyển hóa thức ăn **FCR (Feed Conversion Ratio)**.
4. **Quản lý thức ăn, thuốc thú y và vật tư**:
   - Danh mục vật tư: Thức ăn hỗn hợp cám, vắc-xin, thuốc kháng sinh điều trị, hóa chất sát trùng.
   - Sổ kho Nhập - Xuất - Tồn theo thời gian thực, cảnh báo khi tồn kho chạm ngưỡng tối thiểu.
5. **Lịch tiêm phòng, vệ sinh và khử trùng**:
   - Lập lịch tiêm phòng vắc-xin theo phác đồ độ tuổi (Dịch tả, Lở mồm long móng, Tai xanh...).
   - Lịch phun tiêu độc khử trùng chuồng trại định kỳ, giám sát và đánh dấu hoàn thành.
6. **Theo dõi sức khỏe, dịch bệnh và điều trị**:
   - Ghi nhận triệu chứng, chẩn đoán bệnh, buồng cách ly ca bệnh.
   - Quản lý phác đồ thuốc và **giám sát nghiêm ngặt thời gian ngưng thuốc kháng sinh (Withdrawal Period)** trước khi cho phép xuất chuồng để đảm bảo an toàn vệ sinh thực phẩm.
7. **Quản lý nhập đàn, xuất đàn và tiêu thụ**:
   - Phiếu nhập đàn giống (số lượng, đơn giá, kiểm dịch).
   - Phiếu xuất bán thương phẩm (số lượng, khối lượng cân xuất, giá bán/kg, doanh thu, đơn vị thu mua).
8. **Truy xuất nguồn gốc vật nuôi hoặc sản phẩm (Hộ chiếu số & QR Code)**:
   - Cơ chế cấp mã QR Hộ chiếu số kiểm tra 3 điều kiện: (1) Tiêm phòng đầy đủ 100%, (2) Đủ thời gian ngưng kháng sinh, (3) Thú y kiểm dịch an toàn.
   - Người tiêu dùng và siêu thị quét mã QR để xem minh bạch toàn bộ lý lịch nuôi dưỡng VietGAHP.
9. **Quản lý khách hàng, đơn hàng và hợp đồng**:
   - Hợp đồng bao tiêu đầu ra với doanh nghiệp (VISSAN, Bách Hóa Xanh...).
   - Theo dõi tiến độ giao hàng, đơn đặt hàng và công nợ thanh toán.
10. **Tổng hợp chi phí, sản lượng và hiệu quả chăn nuôi**:
    - Báo cáo chi tiết cơ cấu chi phí: Con giống, cám thức ăn, thuốc men & vắc-xin, nhân công, điện nước khấu hao.
    - Hạch toán doanh thu, lợi nhuận ròng, tỷ lệ sống sót và lợi nhuận trên mỗi đầu con.

---

## 🛠️ Hướng dẫn Khởi chạy Dự án

### 1. Khởi chạy Giao diện Web Dashboard
```powershell
cd apps\web
npm run dev
```
Truy cập vào trình duyệt: `http://localhost:5173` để trải nghiệm đầy đủ 10 phân hệ nghiệp vụ.

### 2. Quản lý Cơ sở Dữ liệu Prisma (PostgreSQL)
```powershell
cd packages\database
npm run db:generate   # Tạo Prisma Client
npm run db:push       # Đồng bộ cấu trúc 10 phân hệ vào CSDL PostgreSQL
npm run db:seed       # Nạp dữ liệu mẫu HTX Minh Trung
```

### 3. Công cụ Tự động hóa Git
Chạy trực tiếp file helper đã tạo:
```powershell
.\git-flow
```
hoặc nhấp đúp chuột vào `git-flow.bat`.
