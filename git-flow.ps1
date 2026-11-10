<#
.SYNOPSIS
    CROP COOP — Git Workflow Automation Script (PowerShell)
    Tối ưu hóa các thao tác Git thường dùng.

.DESCRIPTION
    Chạy tương tác qua Menu:
        .\git-flow.ps1
    Hoặc chạy nhanh 1 lệnh:
        .\git-flow.ps1 sync "nội dung commit"
        .\git-flow.ps1 status
        .\git-flow.ps1 diff
        .\git-flow.ps1 log
        .\git-flow.ps1 stash
        .\git-flow.ps1 pop
#>

param(
    [string]$Action,
    [string]$Message
)

# Thiết lập bảng mã UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Get-CurrentBranch {
    try {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($branch) { return $branch.Trim() }
    } catch {}
    return "unknown"
}

function Show-Header {
    param([string]$Title)
    Write-Host "`n=== $Title ===" -ForegroundColor Cyan
}

function Invoke-Status {
    Show-Header "TRẠNG THÁI CÁC FILE (git status)"
    git status
}

function Invoke-Diff {
    Show-Header "CHI TIẾT CÁC THAY ĐỔI (git diff)"
    git diff
}

function Invoke-AddFile {
    Show-Header "THÊM 1 FILE CỤ THỂ"
    git status -s
    $file = Read-Host "`nNhập đường dẫn file cần add"
    if ($file) {
        git add $file
        Write-Host "[✓] Đã add: $file" -ForegroundColor Green
    }
}

function Invoke-Commit {
    Show-Header "COMMIT CÁC FILE ĐÃ ADD"
    $msg = Read-Host "Nhập thông điệp commit"
    if ($msg) {
        git commit -m $msg
        Write-Host "[✓] Đã tạo commit thành công!" -ForegroundColor Green
    } else {
        Write-Host "[!] Thông điệp commit không được để trống." -ForegroundColor Red
    }
}

function Invoke-CommitAmend {
    Write-Host "`n[!] CẢNH BÁO: Chỉ dùng khi commit gần nhất CHƯA push lên GitHub." -ForegroundColor Yellow
    git log -1 --oneline
    $newMsg = Read-Host "Nhập thông điệp mới (hoặc Enter để giữ nguyên)"
    if ($newMsg) {
        git commit --amend -m $newMsg
    } else {
        git commit --amend --no-edit
    }
    Write-Host "[✓] Đã cập nhật commit gần nhất!" -ForegroundColor Green
}

function Invoke-RemoteAdd {
    Show-Header "KẾT NỐI VỚI REPOSITORY GITHUB"
    Write-Host "Remote hiện tại:" -ForegroundColor DarkGray
    git remote -v
    $url = Read-Host "`nNhập URL kho GitHub (ví dụ https://github.com/user/repo.git)"
    if ($url) {
        $hasOrigin = git remote | Where-Object { $_ -eq "origin" }
        if ($hasOrigin) {
            git remote set-url origin $url
            Write-Host "[✓] Đã cập nhật lại origin thành: $url" -ForegroundColor Green
        } else {
            git remote add origin $url
            Write-Host "[✓] Đã kết nối với: $url" -ForegroundColor Green
        }
    }
}

function Invoke-Push {
    $branch = Get-CurrentBranch
    Show-Header "PUSH CODE LÊN GITHUB"
    $inputBranch = Read-Host "Tên nhánh muốn push [Mặc định: $branch]"
    if (-not $inputBranch) { $inputBranch = $branch }
    Write-Host "Đang đẩy code lên origin/$inputBranch..." -ForegroundColor Yellow
    git push -u origin $inputBranch
}

function Invoke-Pull {
    $branch = Get-CurrentBranch
    Show-Header "PULL CODE MỚI NHẤT TỪ GITHUB"
    $inputBranch = Read-Host "Tên nhánh muốn pull [Mặc định: $branch]"
    if (-not $inputBranch) { $inputBranch = $branch }
    Write-Host "Đang pull code từ origin/$inputBranch..." -ForegroundColor Yellow
    git pull origin $inputBranch
}

function Invoke-Fetch {
    Show-Header "FETCH DỮ LIỆU TỪ GITHUB"
    git fetch origin --prune
    Write-Host "[✓] Đã tải về lịch sử mới nhất từ GitHub." -ForegroundColor Green
}

function Invoke-BranchList {
    Show-Header "DANH SÁCH NHÁNH HIỆN CÓ"
    git branch -a
}

function Invoke-BranchCreate {
    $name = Read-Host "Nhập tên nhánh mới"
    if ($name) {
        git branch $name
        Write-Host "[✓] Đã tạo nhánh: $name" -ForegroundColor Green
    }
}

function Invoke-BranchSwitch {
    git branch
    $name = Read-Host "Nhập tên nhánh muốn chuyển đến"
    if ($name) {
        git switch $name
    }
}

function Invoke-BranchCreateAndSwitch {
    $name = Read-Host "Nhập tên nhánh mới muốn tạo và chuyển sang ngay"
    if ($name) {
        git switch -c $name
        Write-Host "[✓] Đang làm việc trên nhánh mới: $name" -ForegroundColor Green
    }
}

function Invoke-BranchMerge {
    $branch = Get-CurrentBranch
    Write-Host "`nBạn đang đứng ở nhánh: $branch" -ForegroundColor Yellow
    $source = Read-Host "Nhập tên nhánh muốn gộp (merge) vào $branch"
    if ($source) {
        git merge $source
    }
}

function Invoke-BranchDelete {
    git branch
    $del = Read-Host "Nhập tên nhánh cần xóa"
    if ($del) {
        $confirm = Read-Host "Bạn có chắc chắn muốn xóa nhánh '$del'? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            git branch -d $del
        }
    }
}

function Invoke-LogOneline {
    Show-Header "LỊCH SỬ COMMIT (10 COMMIT GẦN NHẤT)"
    git log --oneline -n 10 --graph --decorate
}

function Invoke-LogFull {
    Show-Header "LỊCH SỬ COMMIT CHI TIẾT"
    git log -n 5
}

function Invoke-ResetSoft {
    Write-Host "`n[git reset --soft HEAD~1]" -ForegroundColor Yellow
    Write-Host "Hành động: Hủy commit gần nhất nhưng GIỮ NGUYÊN code đã sửa trong Staging." -ForegroundColor Green
    $confirm = Read-Host "Bạn có muốn tiếp tục? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        git reset --soft HEAD~1
        Write-Host "[✓] Đã hoàn tác commit gần nhất (code vẫn an toàn)." -ForegroundColor Green
    }
}

function Invoke-ResetHard {
    Write-Host "`n[CẢNH BÁO NGUY HIỂM: git reset --hard HEAD~1]" -ForegroundColor Red
    Write-Host "Hành động này sẽ XÓA BỎ HOÀN TOÀN commit gần nhất và MỌI THAY ĐỔI của nó!" -ForegroundColor Red
    $confirm = Read-Host "Nhập 'yes' để xác nhận xóa"
    if ($confirm -eq "yes") {
        git reset --hard HEAD~1
        Write-Host "[✓] Đã hủy commit và xóa sạch thay đổi." -ForegroundColor Red
    } else {
        Write-Host "[!] Đã hủy thao tác." -ForegroundColor Yellow
    }
}

function Invoke-RestoreFile {
    git status -s
    $file = Read-Host "`nNhập tên file muốn khôi phục về trạng thái cũ"
    if ($file) {
        git restore $file
        Write-Host "[✓] Đã hủy bỏ các thay đổi của: $file" -ForegroundColor Green
    }
}

function Invoke-Stash {
    $note = Read-Host "Nhập ghi chú cho bản stash (hoặc Enter)"
    if ($note) {
        git stash push -m $note
    } else {
        git stash
    }
    Write-Host "[✓] Đã lưu tạm thời vào stash." -ForegroundColor Green
}

function Invoke-StashPop {
    git stash pop
}

function Invoke-StashList {
    Show-Header "DANH SÁCH BẢN LƯU TẠM (STASH LIST)"
    git stash list
}

function Invoke-QuickSync {
    param([string]$commitMsg)
    $branch = Get-CurrentBranch
    Write-Host "`n=== ⚡ QUICK SYNC (ADD ALL + COMMIT + PUSH) ===" -ForegroundColor Magenta

    if (-not $commitMsg) {
        $commitMsg = Read-Host "Nhập nội dung commit"
    }

    if (-not $commitMsg) {
        Write-Host "[!] Không được bỏ trống thông điệp commit." -ForegroundColor Red
        return
    }

    Write-Host "1/3: git add ." -ForegroundColor Yellow
    git add .

    Write-Host "2/3: git commit -m `"$commitMsg`"" -ForegroundColor Yellow
    git commit -m $commitMsg

    Write-Host "3/3: git push origin $branch" -ForegroundColor Yellow
    git push -u origin $branch

    Write-Host "🎉 Hoàn tất đồng bộ code lên GitHub!" -ForegroundColor Green
}

# --- Xử lý tham số truyền vào trực tiếp ---
if ($Action -eq "sync" -or $Action -eq "push") {
    Invoke-QuickSync -commitMsg $Message
    exit
} elseif ($Action -eq "status") {
    Invoke-Status
    exit
} elseif ($Action -eq "diff") {
    Invoke-Diff
    exit
} elseif ($Action -eq "log") {
    Invoke-LogOneline
    exit
} elseif ($Action -eq "stash") {
    Invoke-Stash
    exit
} elseif ($Action -eq "pop") {
    Invoke-StashPop
    exit
}

# --- Vòng lặp Menu tương tác ---
while ($true) {
    $branch = Get-CurrentBranch
    Write-Host "`n=================================================================" -ForegroundColor Blue
    Write-Host "               🌾 CROP COOP — GIT WORKFLOW HELPER               " -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Blue
    Write-Host " Nhánh hiện tại: $branch" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Blue
    Write-Host " ⚡ ĐỒNG BỘ NHANH:" -ForegroundColor White
    Write-Host "   1. Quick Sync (Add tất cả + Commit + Push lên GitHub)" -ForegroundColor Green
    Write-Host ""
    Write-Host " 1. TRẠNG THÁI & SO SÁNH:" -ForegroundColor White
    Write-Host "   2. git status (Xem trạng thái các file)" -ForegroundColor Cyan
    Write-Host "   3. git diff   (Xem chi tiết code thay đổi)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " 2. THÊM FILE & COMMIT:" -ForegroundColor White
    Write-Host "   4. git add <file> (Thêm 1 file cụ thể)" -ForegroundColor Cyan
    Write-Host "   5. git add .      (Thêm toàn bộ file thay đổi)" -ForegroundColor Cyan
    Write-Host "   6. git commit -m  (Tạo commit mới)" -ForegroundColor Cyan
    Write-Host "   7. git commit --amend (Sửa lại commit gần nhất)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " 3. ĐỒNG BỘ VỚI GITHUB:" -ForegroundColor White
    Write-Host "   8. git remote add origin (Kết nối URL kho GitHub)" -ForegroundColor Cyan
    Write-Host "   9. git push   (Đẩy code lên GitHub)" -ForegroundColor Cyan
    Write-Host "  10. git pull   (Tải & gộp code mới về)" -ForegroundColor Cyan
    Write-Host "  11. git fetch  (Chỉ tải thông tin mới từ GitHub)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " 4. QUẢN LÝ NHÁNH (BRANCH):" -ForegroundColor White
    Write-Host "  12. git branch (Liệt kê các nhánh)" -ForegroundColor Cyan
    Write-Host "  13. Tạo nhánh mới" -ForegroundColor Cyan
    Write-Host "  14. Chuyển nhánh (git switch)" -ForegroundColor Cyan
    Write-Host "  15. Tạo & chuyển sang nhánh mới ngay (git switch -c)" -ForegroundColor Cyan
    Write-Host "  16. Gộp nhánh (git merge)" -ForegroundColor Cyan
    Write-Host "  17. Xóa nhánh (git branch -d)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " 5. LỊCH SỬ & HOÀN TÁC (HISTORY & UNDO):" -ForegroundColor White
    Write-Host "  18. git log --oneline (Xem lịch sử rút gọn)" -ForegroundColor Cyan
    Write-Host "  19. git log chi tiết" -ForegroundColor Cyan
    Write-Host "  20. git reset --soft (Hủy commit, giữ lại code)" -ForegroundColor Cyan
    Write-Host "  21. git reset --hard (HỦY COMMIT & XÓA SẠCH CODE - Nguy hiểm)" -ForegroundColor Red
    Write-Host "  22. Khôi phục 1 file về trạng thái cũ" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " 6. BỘ NHỚ TẠM (STASH):" -ForegroundColor White
    Write-Host "  23. git stash (Lưu tạm code đang làm dở)" -ForegroundColor Cyan
    Write-Host "  24. git stash pop (Lấy lại code đã lưu tạm)" -ForegroundColor Cyan
    Write-Host "  25. git stash list (Xem danh sách stash)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   0. Thoát" -ForegroundColor Red
    Write-Host "=================================================================" -ForegroundColor Blue

    $choice = Read-Host "👉 Nhập lựa chọn của bạn [0-25]"

    switch ($choice) {
        "1"  { Invoke-QuickSync }
        "2"  { Invoke-Status }
        "3"  { Invoke-Diff }
        "4"  { Invoke-AddFile }
        "5"  { git add .; Write-Host "[✓] Đã add tất cả file thay đổi." -ForegroundColor Green }
        "6"  { Invoke-Commit }
        "7"  { Invoke-CommitAmend }
        "8"  { Invoke-RemoteAdd }
        "9"  { Invoke-Push }
        "10" { Invoke-Pull }
        "11" { Invoke-Fetch }
        "12" { Invoke-BranchList }
        "13" { Invoke-BranchCreate }
        "14" { Invoke-BranchSwitch }
        "15" { Invoke-BranchCreateAndSwitch }
        "16" { Invoke-BranchMerge }
        "17" { Invoke-BranchDelete }
        "18" { Invoke-LogOneline }
        "19" { Invoke-LogFull }
        "20" { Invoke-ResetSoft }
        "21" { Invoke-ResetHard }
        "22" { Invoke-RestoreFile }
        "23" { Invoke-Stash }
        "24" { Invoke-StashPop }
        "25" { Invoke-StashList }
        "0"  { Write-Host "Tạm biệt! Chúc bạn làm việc hiệu quả." -ForegroundColor Green; exit }
        default { Write-Host "[!] Lựa chọn không hợp lệ." -ForegroundColor Red }
    }

    Write-Host ""
    Read-Host "Nhấn [Enter] để quay lại menu chính..."
}
