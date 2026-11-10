#!/usr/bin/env bash

# =============================================================================
# CROP COOP — Git Workflow Automation Script
# Tối ưu hóa các thao tác Git thường dùng
# Cách chạy: 
#   - Tương tác qua Menu: ./git-flow.sh hoặc bash git-flow.sh
#   - Chạy nhanh 1 lệnh:  ./git-flow.sh sync "nội dung commit"
# =============================================================================

# Màu sắc hiển thị
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Kiểm tra xem có đang ở trong Git repository không
check_git_repo() {
  if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}[!] Thư mục hiện tại không phải là Git repository.${NC}"
    read -p "Bạn có muốn khởi tạo git init ngay bây giờ? (y/N): " init_choice
    if [[ "$init_choice" =~ ^[Yy]$ ]]; then
      git init
      git branch -M main
      echo -e "${GREEN}[✓] Đã khởi tạo Git repository với nhánh mặc định là main.${NC}"
    else
      exit 1
    fi
  fi
}

# Lấy tên nhánh hiện tại
get_current_branch() {
  git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

# =============================================================================
# CÁC HÀM XỬ LÝ CHÍNH
# =============================================================================

# 1. Trạng thái & So sánh (Status & Diff)
fn_status() {
  echo -e "\n${CYAN}${BOLD}=== TRẠNG THÁI CÁC FILE (git status -s) ===${NC}"
  git status
}

fn_diff() {
  echo -e "\n${CYAN}${BOLD}=== CHI TIẾT CÁC THAY ĐỔI (git diff) ===${NC}"
  git diff
}

# 2. Thêm file & Commit
fn_add_file() {
  echo -e "\n${CYAN}Danh sách file có thay đổi:${NC}"
  git status -s
  echo ""
  read -p "Nhập đường dẫn file cần add: " file_path
  if [ -n "$file_path" ]; then
    git add "$file_path"
    echo -e "${GREEN}[✓] Đã add: $file_path${NC}"
  else
    echo -e "${YELLOW}[!] Chưa nhập tên file.${NC}"
  fi
}

fn_commit() {
  echo -e "\n${CYAN}=== COMMIT CÁC FILE ĐÃ ADD ===${NC}"
  read -p "Nhập thông điệp commit: " commit_msg
  if [ -n "$commit_msg" ]; then
    git commit -m "$commit_msg"
    echo -e "${GREEN}[✓] Đã tạo commit thành công!${NC}"
  else
    echo -e "${RED}[!] Thông điệp commit không được để trống.${NC}"
  fi
}

fn_commit_amend() {
  echo -e "\n${YELLOW}${BOLD}[!] CẢNH BÁO: Chỉ dùng khi commit gần nhất CHƯA push lên GitHub.${NC}"
  echo -e "Commit gần nhất:"
  git log -1 --oneline
  read -p "Nhập thông điệp mới (hoặc Enter để giữ nguyên): " new_msg
  if [ -n "$new_msg" ]; then
    git commit --amend -m "$new_msg"
  else
    git commit --amend --no-edit
  fi
  echo -e "${GREEN}[✓] Đã cập nhật commit gần nhất!${NC}"
}

# 3. Đồng bộ với GitHub (Syncing)
fn_remote_add() {
  echo -e "\n${CYAN}=== KẾT NỐI VỚI REPOSITORY GITHUB ===${NC}"
  echo -e "Remote hiện tại:"
  git remote -v
  echo ""
  read -p "Nhập URL kho GitHub (ví dụ https://github.com/user/repo.git): " remote_url
  if [ -n "$remote_url" ]; then
    if git remote | grep -q "^origin$"; then
      git remote set-url origin "$remote_url"
      echo -e "${GREEN}[✓] Đã cập nhật lại origin thành: $remote_url${NC}"
    else
      git remote add origin "$remote_url"
      echo -e "${GREEN}[✓] Đã kết nối với: $remote_url${NC}"
    fi
  fi
}

fn_push() {
  CURRENT_BRANCH=$(get_current_branch)
  echo -e "\n${CYAN}=== PUSH CODE LÊN GITHUB ===${NC}"
  read -p "Tên nhánh muốn push [Mặc định: $CURRENT_BRANCH]: " branch
  branch=${branch:-$CURRENT_BRANCH}
  
  echo -e "${YELLOW}Đang đẩy code lên origin/$branch...${NC}"
  git push -u origin "$branch"
}

fn_pull() {
  CURRENT_BRANCH=$(get_current_branch)
  echo -e "\n${CYAN}=== PULL CODE MỚI NHẤT TỪ GITHUB ===${NC}"
  read -p "Tên nhánh muốn pull [Mặc định: $CURRENT_BRANCH]: " branch
  branch=${branch:-$CURRENT_BRANCH}
  
  echo -e "${YELLOW}Đang pull code từ origin/$branch...${NC}"
  git pull origin "$branch"
}

fn_fetch() {
  echo -e "\n${CYAN}=== FETCH TẤT CẢ DỮ LIỆU TỪ GITHUB ===${NC}"
  git fetch origin --prune
  echo -e "${GREEN}[✓] Đã tải về lịch sử mới nhất từ GitHub.${NC}"
}

# 4. Quản lý nhánh (Branching)
fn_branch_list() {
  echo -e "\n${CYAN}${BOLD}=== DANH SÁCH NHÁNH HIỆN CÓ ===${NC}"
  git branch -a
}

fn_branch_create() {
  read -p "Nhập tên nhánh mới: " new_branch
  if [ -n "$new_branch" ]; then
    git branch "$new_branch"
    echo -e "${GREEN}[✓] Đã tạo nhánh: $new_branch${NC}"
  fi
}

fn_branch_switch() {
  echo -e "\n${CYAN}Các nhánh local hiện có:${NC}"
  git branch
  read -p "Nhập tên nhánh muốn chuyển đến: " switch_branch
  if [ -n "$switch_branch" ]; then
    git switch "$switch_branch"
  fi
}

fn_branch_create_and_switch() {
  read -p "Nhập tên nhánh mới muốn tạo và chuyển sang ngay: " new_branch
  if [ -n "$new_branch" ]; then
    git switch -c "$new_branch"
    echo -e "${GREEN}[✓] Đang làm việc trên nhánh mới: $new_branch${NC}"
  fi
}

fn_branch_merge() {
  CURRENT_BRANCH=$(get_current_branch)
  echo -e "\n${YELLOW}Bạn đang đứng ở nhánh: ${BOLD}$CURRENT_BRANCH${NC}"
  read -p "Nhập tên nhánh muốn gộp (merge) vào $CURRENT_BRANCH: " merge_source
  if [ -n "$merge_source" ]; then
    git merge "$merge_source"
  fi
}

fn_branch_delete() {
  echo -e "\n${CYAN}Danh sách nhánh:${NC}"
  git branch
  read -p "Nhập tên nhánh cần xóa: " del_branch
  if [ -n "$del_branch" ]; then
    read -p "Bạn có chắc chắn muốn xóa nhánh '$del_branch'? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      git branch -d "$del_branch"
    fi
  fi
}

# 5. Lịch sử & Hoàn tác (History & Undo)
fn_log_oneline() {
  echo -e "\n${CYAN}${BOLD}=== LỊCH SỬ COMMIT (10 COMMIT GẦN NHẤT) ===${NC}"
  git log --oneline -n 10 --graph --decorate
}

fn_log_full() {
  echo -e "\n${CYAN}${BOLD}=== LỊCH SỬ COMMIT CHI TIẾT ===${NC}"
  git log -n 5
}

fn_reset_soft() {
  echo -e "\n${YELLOW}${BOLD}[git reset --soft HEAD~1]${NC}"
  echo -e "Hành động: Hủy commit gần nhất nhưng ${GREEN}GIỮ NGUYÊN${NC} code đã sửa trong Staging."
  read -p "Bạn có muốn tiếp tục? (y/N): " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    git reset --soft HEAD~1
    echo -e "${GREEN}[✓] Đã hoàn tác commit gần nhất (code vẫn được giữ an toàn).${NC}"
  fi
}

fn_reset_hard() {
  echo -e "\n${RED}${BOLD}[CẢNH BÁO NGUY HIỂM: git reset --hard HEAD~1]${NC}"
  echo -e "${RED}Hành động này sẽ XÓA BỎ HOÀN TOÀN commit gần nhất và MỌI THAY ĐỔI của nó!${NC}"
  read -p "Bạn có thực sự chắc chắn muốn XÓA? (nhập 'yes' để xác nhận): " confirm
  if [ "$confirm" = "yes" ]; then
    git reset --hard HEAD~1
    echo -e "${RED}[✓] Đã hủy commit và xóa sạch thay đổi.${NC}"
  else
    echo -e "${YELLOW}[!] Đã hủy thao tác.${NC}"
  fi
}

fn_restore_file() {
  echo -e "\n${CYAN}Các file bị thay đổi chưa commit:${NC}"
  git status -s
  read -p "Nhập tên file muốn khôi phục về trạng thái cũ: " file_path
  if [ -n "$file_path" ]; then
    git checkout -- "$file_path" 2>/dev/null || git restore "$file_path"
    echo -e "${GREEN}[✓] Đã hủy bỏ các thay đổi của: $file_path${NC}"
  fi
}

# 6. Quản lý Stash (Bộ nhớ tạm)
fn_stash() {
  read -p "Nhập ghi chú cho bản stash (hoặc Enter): " stash_msg
  if [ -n "$stash_msg" ]; then
    git stash push -m "$stash_msg"
  else
    git stash
  fi
  echo -e "${GREEN}[✓] Đã lưu tạm thời các thay đổi vào stash.${NC}"
}

fn_stash_pop() {
  echo -e "\n${CYAN}Lấy lại bản thay đổi gần nhất từ stash...${NC}"
  git stash pop
}

fn_stash_list() {
  echo -e "\n${CYAN}${BOLD}=== DANH SÁCH BẢN LƯU TẠM (STASH LIST) ===${NC}"
  git stash list
}

# 7. Quick Sync: Add All -> Commit -> Push (Tính năng tiện lợi nhất)
fn_quick_sync() {
  CURRENT_BRANCH=$(get_current_branch)
  echo -e "\n${MAGENTA}${BOLD}=== ⚡ QUICK SYNC (ADD ALL + COMMIT + PUSH) ===${NC}"
  
  if [ -z "$1" ]; then
    read -p "Nhập nội dung commit: " commit_msg
  else
    commit_msg="$1"
  fi

  if [ -z "$commit_msg" ]; then
    echo -e "${RED}[!] Không được bỏ trống thông điệp commit.${NC}"
    return
  fi

  echo -e "${YELLOW}1/3: git add .${NC}"
  git add .
  
  echo -e "${YELLOW}2/3: git commit -m \"$commit_msg\"${NC}"
  git commit -m "$commit_msg"
  
  echo -e "${YELLOW}3/3: git push origin $CURRENT_BRANCH${NC}"
  git push -u origin "$CURRENT_BRANCH"
  
  echo -e "${GREEN}${BOLD}🎉 Hoàn tất đồng bộ code lên GitHub!${NC}"
}

# =============================================================================
# XỬ LÝ ARGUMENTS CHẠY NHANH
# =============================================================================
check_git_repo

if [ "$1" = "sync" ] || [ "$1" = "push" ]; then
  fn_quick_sync "$2"
  exit 0
elif [ "$1" = "status" ]; then
  fn_status
  exit 0
elif [ "$1" = "diff" ]; then
  fn_diff
  exit 0
elif [ "$1" = "log" ]; then
  fn_log_oneline
  exit 0
elif [ "$1" = "stash" ]; then
  fn_stash
  exit 0
elif [ "$1" = "pop" ]; then
  fn_stash_pop
  exit 0
fi

# =============================================================================
# GIAO DIỆN MENU TƯƠNG TÁC
# =============================================================================
while true; do
  CURRENT_BRANCH=$(get_current_branch)
  echo -e "\n${BLUE}=================================================================${NC}"
  echo -e "${BOLD}${GREEN}               🌾 CROP COOP — GIT WORKFLOW HELPER               ${NC}"
  echo -e "${BLUE}=================================================================${NC}"
  echo -e " Nhánh hiện tại: ${YELLOW}${BOLD}$CURRENT_BRANCH${NC}"
  echo -e "${BLUE}-----------------------------------------------------------------${NC}"
  echo -e " ${BOLD}⚡ ĐỒNG BỘ NHANH:${NC}"
  echo -e "   ${GREEN}1.${NC} Quick Sync (Add tất cả + Commit + Push lên GitHub)"
  echo ""
  echo -e " ${BOLD}1. TRẠNG THÁI & SO SÁNH:${NC}"
  echo -e "   ${CYAN}2.${NC} git status (Xem trạng thái các file)"
  echo -e "   ${CYAN}3.${NC} git diff   (Xem chi tiết code thay đổi)"
  echo ""
  echo -e " ${BOLD}2. THÊM FILE & COMMIT:${NC}"
  echo -e "   ${CYAN}4.${NC} git add <file> (Thêm 1 file cụ thể)"
  echo -e "   ${CYAN}5.${NC} git add .      (Thêm toàn bộ file thay đổi)"
  echo -e "   ${CYAN}6.${NC} git commit -m  (Tạo commit mới)"
  echo -e "   ${CYAN}7.${NC} git commit --amend (Sửa lại commit gần nhất)"
  echo ""
  echo -e " ${BOLD}3. ĐỒNG BỘ VỚI GITHUB:${NC}"
  echo -e "   ${CYAN}8.${NC} git remote add origin (Kết nối URL kho GitHub)"
  echo -e "   ${CYAN}9.${NC} git push   (Đẩy code lên GitHub)"
  echo -e "  ${CYAN}10.${NC} git pull   (Tải & gộp code mới về)"
  echo -e "  ${CYAN}11.${NC} git fetch  (Chỉ tải thông tin mới từ GitHub)"
  echo ""
  echo -e " ${BOLD}4. QUẢN LÝ NHÁNH (BRANCH):${NC}"
  echo -e "  ${CYAN}12.${NC} git branch (Liệt kê các nhánh)"
  echo -e "  ${CYAN}13.${NC} Tạo nhánh mới"
  echo -e "  ${CYAN}14.${NC} Chuyển nhánh (git switch)"
  echo -e "  ${CYAN}15.${NC} Tạo & chuyển sang nhánh mới ngay (git switch -c)"
  echo -e "  ${CYAN}16.${NC} Gộp nhánh (git merge)"
  echo -e "  ${CYAN}17.${NC} Xóa nhánh (git branch -d)"
  echo ""
  echo -e " ${BOLD}5. LỊCH SỬ & HOÀN TÁC (HISTORY & UNDO):${NC}"
  echo -e "  ${CYAN}18.${NC} git log --oneline (Xem lịch sử rút gọn)"
  echo -e "  ${CYAN}19.${NC} git log chi tiết"
  echo -e "  ${CYAN}20.${NC} git reset --soft (Hủy commit, giữ lại code)"
  echo -e "  ${RED}21.${NC} git reset --hard (HỦY COMMIT & XÓA SẠCH CODE - Nguy hiểm)"
  echo -e "  ${CYAN}22.${NC} Khôi phục 1 file về trạng thái cũ"
  echo ""
  echo -e " ${BOLD}6. BỘ NHỚ TẠM (STASH):${NC}"
  echo -e "  ${CYAN}23.${NC} git stash (Lưu tạm code đang làm dở)"
  echo -e "  ${CYAN}24.${NC} git stash pop (Lấy lại code đã lưu tạm)"
  echo -e "  ${CYAN}25.${NC} git stash list (Xem danh sách stash)"
  echo ""
  echo -e "   ${RED}0. Thoát${NC}"
  echo -e "${BLUE}=================================================================${NC}"
  read -p "👉 Nhập lựa chọn của bạn [0-25]: " choice

  case "$choice" in
    1) fn_quick_sync ;;
    2) fn_status ;;
    3) fn_diff ;;
    4) fn_add_file ;;
    5) git add . && echo -e "${GREEN}[✓] Đã add tất cả file thay đổi.${NC}" ;;
    6) fn_commit ;;
    7) fn_commit_amend ;;
    8) fn_remote_add ;;
    9) fn_push ;;
    10) fn_pull ;;
    11) fn_fetch ;;
    12) fn_branch_list ;;
    13) fn_branch_create ;;
    14) fn_branch_switch ;;
    15) fn_branch_create_and_switch ;;
    16) fn_branch_merge ;;
    17) fn_branch_delete ;;
    18) fn_log_oneline ;;
    19) fn_log_full ;;
    20) fn_reset_soft ;;
    21) fn_reset_hard ;;
    22) fn_restore_file ;;
    23) fn_stash ;;
    24) fn_stash_pop ;;
    25) fn_stash_list ;;
    0) echo -e "${GREEN}Tạm biệt! Chúc bạn làm việc hiệu quả.${NC}"; exit 0 ;;
    *) echo -e "${RED}[!] Lựa chọn không hợp lệ. Vui lòng chọn từ 0 đến 25.${NC}" ;;
  esac

  echo ""
  read -p "Nhấn [Enter] để quay lại menu chính..." dummy
done
