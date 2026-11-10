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
    Show-Header "TRANG THAI CAC FILE (git status)"
    git status
}

function Invoke-Diff {
    Show-Header "CHI TIET CAC THAY DOI (git diff)"
    git diff
}

function Invoke-AddFile {
    Show-Header "THEM 1 FILE CU THE"
    git status -s
    $file = Read-Host "`nNhap duong dan file can add"
    if ($file) {
        git add $file
        Write-Host "[OK] Da add: $file" -ForegroundColor Green
    }
}

function Invoke-AddAll {
    Show-Header "THEM TAT CA FILE THAY DOI (git add .)"
    git add .
    Write-Host "[OK] Da add tat ca file thay doi vao Staging." -ForegroundColor Green
    git status -s
}

function Invoke-Commit {
    Show-Header "COMMIT CAC FILE DA ADD"
    $msg = Read-Host "Nhap thong diep commit"
    if ($msg) {
        git commit -m $msg
        Write-Host "[OK] Da tao commit thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "[!] Thong diep commit khong duoc de trong." -ForegroundColor Red
    }
}

function Invoke-CommitAmend {
    Write-Host "`n[!] CANH BAO: Chi dung khi commit gan nhat CHUA push len GitHub." -ForegroundColor Yellow
    git log -1 --oneline
    $newMsg = Read-Host "Nhap thong diep moi (hoac Enter de giu nguyen)"
    if ($newMsg) {
        git commit --amend -m $newMsg
    } else {
        git commit --amend --no-edit
    }
    Write-Host "[OK] Da cap nhat commit gan nhat!" -ForegroundColor Green
}

function Invoke-RemoteAdd {
    Show-Header "KET NOI VOI REPOSITORY GITHUB"
    Write-Host "Remote hien tai:" -ForegroundColor DarkGray
    git remote -v
    $url = Read-Host "`nNhap URL kho GitHub (vi du https://github.com/user/repo.git)"
    if ($url) {
        $hasOrigin = git remote | Where-Object { $_ -eq "origin" }
        if ($hasOrigin) {
            git remote set-url origin $url
            Write-Host "[OK] Da cap nhat lai origin thanh: $url" -ForegroundColor Green
        } else {
            git remote add origin $url
            Write-Host "[OK] Da ket noi voi: $url" -ForegroundColor Green
        }
    }
}

function Invoke-Push {
    $branch = Get-CurrentBranch
    Show-Header "PUSH CODE LEN GITHUB"
    $inputBranch = Read-Host "Ten nhanh muon push [Mac dinh: $branch]"
    if (-not $inputBranch) { $inputBranch = $branch }
    Write-Host "Dang day code len origin/$inputBranch..." -ForegroundColor Yellow
    git push -u origin $inputBranch
}

function Invoke-Pull {
    $branch = Get-CurrentBranch
    Show-Header "PULL CODE MOI NHAT TU GITHUB"
    $inputBranch = Read-Host "Ten nhanh muon pull [Mac dinh: $branch]"
    if (-not $inputBranch) { $inputBranch = $branch }
    Write-Host "Dang pull code tu origin/$inputBranch..." -ForegroundColor Yellow
    git pull origin $inputBranch
}

function Invoke-Fetch {
    Show-Header "FETCH DU LIEU TU GITHUB"
    git fetch origin --prune
    Write-Host "[OK] Da tai ve lich su moi nhat tu GitHub." -ForegroundColor Green
}

function Invoke-BranchList {
    Show-Header "DANH SACH NHANH HIEN CO"
    git branch -a
}

function Invoke-BranchCreate {
    $name = Read-Host "Nhap ten nhanh moi"
    if ($name) {
        git branch $name
        Write-Host "[OK] Da tao nhanh: $name" -ForegroundColor Green
    }
}

function Invoke-BranchSwitch {
    git branch
    $name = Read-Host "Nhap ten nhanh muon chuyen den"
    if ($name) {
        git switch $name
    }
}

function Invoke-BranchCreateAndSwitch {
    $name = Read-Host "Nhap ten nhanh moi muon tao va chuyen sang ngay"
    if ($name) {
        git switch -c $name
        Write-Host "[OK] Dang lam viec tren nhanh moi: $name" -ForegroundColor Green
    }
}

function Invoke-BranchMerge {
    $branch = Get-CurrentBranch
    Write-Host "`nBan dang dung o nhanh: $branch" -ForegroundColor Yellow
    $source = Read-Host "Nhap ten nhanh muon gop (merge) vao $branch"
    if ($source) {
        git merge $source
    }
}

function Invoke-BranchDelete {
    git branch
    $del = Read-Host "Nhap ten nhanh can xoa"
    if ($del) {
        $confirm = Read-Host "Ban co chac chan muon xoa nhanh '$del'? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            git branch -d $del
        }
    }
}

function Invoke-LogOneline {
    Show-Header "LICH SU COMMIT (10 COMMIT GAN NHAT)"
    git log --oneline -n 10 --graph --decorate
}

function Invoke-LogFull {
    Show-Header "LICH SU COMMIT CHI TIET"
    git log -n 5
}

function Invoke-ResetSoft {
    Write-Host "`n[git reset --soft HEAD~1]" -ForegroundColor Yellow
    Write-Host "Hanh dong: Huy commit gan nhat nhung GIU NGUYEN code da sua trong Staging." -ForegroundColor Green
    $confirm = Read-Host "Ban co muon tiep tuc? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        git reset --soft HEAD~1
        Write-Host "[OK] Da hoan tac commit gan nhat (code van an toan)." -ForegroundColor Green
    }
}

function Invoke-ResetHard {
    Write-Host "`n[CANH BAO NGUY HIEM: git reset --hard HEAD~1]" -ForegroundColor Red
    Write-Host "Hanh dong nay se XOA BO HOAN TOAN commit gan nhat va MOI THAY DOI cua no!" -ForegroundColor Red
    $confirm = Read-Host "Nhap 'yes' de xac nhan xoa"
    if ($confirm -eq "yes") {
        git reset --hard HEAD~1
        Write-Host "[OK] Da huy commit va xoa sach thay doi." -ForegroundColor Red
    } else {
        Write-Host "[!] Da huy thao tac." -ForegroundColor Yellow
    }
}

function Invoke-RestoreFile {
    git status -s
    $file = Read-Host "`nNhap ten file muon khoi phuc ve trang thai cu"
    if ($file) {
        git restore $file
        Write-Host "[OK] Da huy bo cac thay doi cua: $file" -ForegroundColor Green
    }
}

function Invoke-Stash {
    $note = Read-Host "Nhap ghi chu cho ban stash (hoac Enter)"
    if ($note) {
        git stash push -m $note
    } else {
        git stash
    }
    Write-Host "[OK] Da luu tam thoi vao stash." -ForegroundColor Green
}

function Invoke-StashPop {
    git stash pop
}

function Invoke-StashList {
    Show-Header "DANH SACH BAN LUU TAM (STASH LIST)"
    git stash list
}

function Invoke-QuickSync {
    param([string]$commitMsg)
    $branch = Get-CurrentBranch
    Write-Host "`n=== DONG BO NHANH (ADD ALL + COMMIT + PUSH) ===" -ForegroundColor Magenta

    if (-not $commitMsg) {
        $commitMsg = Read-Host "Nhap noi dung commit"
    }

    if (-not $commitMsg) {
        Write-Host "[!] Khong duoc bo trong thong diep commit." -ForegroundColor Red
        return
    }

    Write-Host "1/3: git add ." -ForegroundColor Yellow
    git add .

    Write-Host "2/3: git commit -m `"$commitMsg`"" -ForegroundColor Yellow
    git commit -m $commitMsg

    Write-Host "3/3: git push origin $branch" -ForegroundColor Yellow
    git push -u origin $branch

    Write-Host "Hoan tat dong bo code len GitHub!" -ForegroundColor Green
}

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

$menuItems = @(
    "[QUICK SYNC]  Add tat ca + Commit + Push len GitHub",
    "[STATUS]      git status - Xem trang thai cac file",
    "[DIFF]        git diff - Xem chi tiet code thay doi",
    "[ADD ALL]     git add . - Them tat ca file thay doi",
    "[ADD FILE]    git add <file> - Them 1 file cu the",
    "[COMMIT]      git commit -m - Tao commit moi kem mo ta",
    "[AMEND]       git commit --amend - Sua commit gan nhat",
    "[PUSH]        git push - Day commit len GitHub",
    "[PULL]        git pull - Tai va gop code moi tu GitHub",
    "[FETCH]       git fetch - Chi tai thong tin moi tu GitHub",
    "[REMOTE]      git remote add/set origin - Dat URL GitHub",
    "[BRANCH-LS]   git branch - Liet ke tat ca nhanh",
    "[BRANCH-NEW]  git branch <ten> - Tao nhanh moi",
    "[SWITCH]      git switch - Chuyen sang nhanh khac",
    "[SW-NEW]      git switch -c - Tao va chuyen nhanh ngay",
    "[MERGE]       git merge - Gop nhanh khac vao nhanh hien tai",
    "[DEL-BRANCH]  git branch -d - Xoa nhanh local",
    "[LOG-SHORT]   git log --oneline - Xem lich su rut gon",
    "[LOG-FULL]    git log - Xem lich su chi tiet",
    "[UNDO-SOFT]   git reset --soft HEAD~1 - Huy commit (giu code)",
    "[UNDO-HARD]   git reset --hard HEAD~1 - Huy commit va xoa code",
    "[RESTORE]     git restore <file> - Khoi phuc 1 file",
    "[STASH]       git stash - Luu tam code do dang",
    "[STASH-POP]   git stash pop - Lay lai code luu tam",
    "[STASH-LIST]  git stash list - Xem danh sach stash",
    "[THOAT]       Thoat chuong trinh"
)

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
        Write-Host "             CROP COOP - GIT WORKFLOW HELPER                  " -ForegroundColor Green
        Write-Host " Nhanh hien tai: $branch" -ForegroundColor Yellow
        Write-Host "==============================================================" -ForegroundColor Blue
        for ($i = 0; $i -lt $count; $i++) {
            Write-Host (" {0,2}. {1}" -f ($i + 1), $Items[$i])
        }
        $pick = Read-Host "`nNhap so lua chon cua ban (1-$count)"
        if ($pick -match '^\d+$') {
            return [int]$pick - 1
        }
        return $count - 1
    }

    try { [Console]::CursorVisible = $false } catch {}

    while ($true) {
        Clear-Host
        Write-Host "======================================================================" -ForegroundColor Blue
        Write-Host "                  CROP COOP - GIT WORKFLOW HELPER                     " -ForegroundColor Green
        Write-Host "======================================================================" -ForegroundColor Blue
        Write-Host " Nhanh hien tai: " -NoNewline
        Write-Host "$branch" -ForegroundColor Yellow -NoNewline
        Write-Host "  |  Dung phim " -NoNewline
        Write-Host "Mui Ten Len / Xuong" -ForegroundColor Cyan -NoNewline
        Write-Host ", nhan " -NoNewline
        Write-Host "[ENTER]" -ForegroundColor Green -NoNewline
        Write-Host " de chay"
        Write-Host "----------------------------------------------------------------------" -ForegroundColor Blue

        for ($i = 0; $i -lt $count; $i++) {
            if ($i -eq $index) {
                Write-Host " >> " -NoNewline -ForegroundColor Green
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
        25 { Write-Host "`nTam biet! Chuc ban lam viec hieu qua.`n" -ForegroundColor Green; exit }
        default { exit }
    }

    Write-Host ""
    Read-Host "Nhan [Enter] de quay lai menu danh sach..."
}