<#
.SYNOPSIS
    CROP COOP — Git Workflow Automation Script (Interactive Arrow Menu)
#>

param(
    [string]$Action,
    [string]$Message
)

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

function Invoke-AddAll {
    Show-Header "THÊM TẤT CẢ FILE THAY ĐỔI (git add .)"
    git add .
    Write-Host "[✓] Đã add tất cả file thay đổi vào Staging." -ForegroundColor Green
    git status -s
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

# Danh sách menu options
$menuItems = @(
    "⚡ [QUICK SYNC] Add tất cả + Commit + Push lên GitHub",
    "🔍 [STATUS]     git status - Xem trạng thái các file",
    "📝 [DIFF]       git diff - Xem chi tiết dòng code thay đổi",
    "➕ [ADD ALL]    git add . - Thêm tất cả file thay đổi",
    "📄 [ADD FILE]   git add <file> - Thêm 1 file cụ thể",
    "💾 [COMMIT]     git commit -m - Tạo commit mới kèm mô tả",
    "✏️ [AMEND]      git commit --amend - Sửa commit gần nhất",
    "🚀 [PUSH]       git push - Đẩy commit lên GitHub",
    "📥 [PULL]       git pull - Tải & gộp code mới từ GitHub",
    "📡 [FETCH]      git fetch - Chỉ tải thông tin mới từ GitHub",
    "🔗 [REMOTE]     git remote add/set origin - Đặt URL GitHub",
    "🌿 [BRANCH-LS]  git branch - Liệt kê tất cả nhánh",
    "🌱 [BRANCH-NEW] git branch <tên> - Tạo nhánh mới",
    "🔀 [SWITCH]     git switch - Chuyển sang nhánh khác",
    "✨ [SW-NEW]     git switch -c - Tạo & chuyển nhánh ngay",
    "🧩 [MERGE]      git merge - Gộp nhánh khác vào nhánh hiện tại",
    "🗑️ [DEL-BRANCH] git branch -d - Xóa nhánh local",
    "📜 [LOG-SHORT]  git log --oneline - Xem lịch sử rút gọn",
    "📖 [LOG-FULL]   git log - Xem lịch sử chi tiết",
    "↩️ [UNDO-SOFT]  git reset --soft HEAD~1 - Hủy commit (giữ code)",
    "⚠️ [UNDO-HARD]  git reset --hard HEAD~1 - Hủy commit & xóa code",
    "🔄 [RESTORE]    git restore <file> - Khôi phục 1 file",
    "📦 [STASH]      git stash - Lưu tạm code dở dang",
    "📤 [STASH-POP]  git stash pop - Lấy lại code lưu tạm",
    "📋 [STASH-LIST] git stash list - Xem danh sách stash",
    "❌ [THOÁT]      Thoát chương trình"
)

# Hàm điều khiển bằng phím mũi tên (Arrow Navigation)
function Select-ArrowMenu {
    param([string[]]$Items)

    $branch = Get-CurrentBranch
    $index = 0
    $count = $Items.Length

    $canUseKeys = $false
    try {
        if (-not [Console]::IsInputRedirected) { $canUseKeys = $true }
    } catch {}

    if (-not $canUseKeys) {
        Write-Host "`n==============================================================" -ForegroundColor Blue
        Write-Host "             🌾 CROP COOP — GIT WORKFLOW HELPER               " -ForegroundColor Green
        Write-Host " Nhánh hiện tại: $branch" -ForegroundColor Yellow
        Write-Host "==============================================================" -ForegroundColor Blue
        for ($i = 0; $i -lt $count; $i++) {
            Write-Host (" {0,2}. {1}" -f ($i + 1), $Items[$i])
        }
        $pick = Read-Host "`n👉 Nhập số lựa chọn của bạn (1-$count)"
        if ($pick -match '^\d+$') {
            return [int]$pick - 1
        }
        return $count - 1
    }

    try { [Console]::CursorVisible = $false } catch {}

    while ($true) {
        Clear-Host
        Write-Host "======================================================================" -ForegroundColor Blue
        Write-Host "                  🌾 CROP COOP — GIT WORKFLOW HELPER                  " -ForegroundColor Green
        Write-Host "======================================================================" -ForegroundColor Blue
        Write-Host " Nhánh hiện tại: " -NoNewline
        Write-Host "$branch" -ForegroundColor Yellow -NoNewline
        Write-Host "  |  Dùng phím " -NoNewline
        Write-Host "↑ / ↓" -ForegroundColor Cyan -NoNewline
        Write-Host " để chọn, nhấn " -NoNewline
        Write-Host "[ENTER]" -ForegroundColor Green -NoNewline
        Write-Host " để chạy"
        Write-Host "----------------------------------------------------------------------" -ForegroundColor Blue

        for ($i = 0; $i -lt $count; $i++) {
            if ($i -eq $index) {
                Write-Host " 👉 " -NoNewline -ForegroundColor Green
                Write-Host $Items[$i] -BackgroundColor DarkGreen -ForegroundColor White
            } else {
                Write-Host "    $($Items[$i])" -ForegroundColor Gray
            }
        }
        Write-Host "======================================================================" -ForegroundColor Blue

        $key = [Console]::ReadKey($true)
        switch ($key.Key) {
            "UpArrow" {
                $index = ($index - 1 + $count) % $count
            }
            "DownArrow" {
                $index = ($index + 1) % $count
            }
            "Enter" {
                try { [Console]::CursorVisible = $true } catch {}
                return $index
            }
            "Escape" {
                try { [Console]::CursorVisible = $true } catch {}
                return ($count - 1)
            }
        }
    }
}

# Vòng lặp chính
while ($true) {
    $selectedIndex = Select-ArrowMenu -Items $menuItems

    switch ($selectedIndex) {
        0  { Invoke-QuickSync }
        1  { Invoke-Status }
        2  { Invoke-Diff }
        3  { Invoke-AddAll }
        4  { Invoke-AddFile }
        5  { Invoke-Commit }
        6  { Invoke-CommitAmend }
        7  { Invoke-Push }
        8  { Invoke-Pull }
        9  { Invoke-Fetch }
        10 { Invoke-RemoteAdd }
        11 { Invoke-BranchList }
        12 { Invoke-BranchCreate }
        13 { Invoke-BranchSwitch }
        14 { Invoke-BranchCreateAndSwitch }
        15 { Invoke-BranchMerge }
        16 { Invoke-BranchDelete }
        17 { Invoke-LogOneline }
        18 { Invoke-LogFull }
        19 { Invoke-ResetSoft }
        20 { Invoke-ResetHard }
        21 { Invoke-RestoreFile }
        22 { Invoke-Stash }
        23 { Invoke-StashPop }
        24 { Invoke-StashList }
        25 { Write-Host "`nTạm biệt! Chúc bạn làm việc hiệu quả.`n" -ForegroundColor Green; exit }
        default { exit }
    }

    Write-Host ""
    Read-Host "Nhấn [Enter] để quay lại menu danh sách..."
}
