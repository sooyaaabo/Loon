#!/bin/bash
# 一键重置 Git 仓库历史，只保留当前文件状态
# 支持自定义分支名（默认 main）
# 用法：
#   ./ResetGitHistory.sh [分支名]
# 示例：
#   ./ResetGitHistory.sh        # 默认覆盖 main
#   ./ResetGitHistory.sh master   # 覆盖 master 分支

set -e

TARGET_BRANCH=${1:-main}

echo "⚠️ 警告：这将清空分支 [$TARGET_BRANCH] 的历史，只保留当前文件。"
read -p "确定继续吗？(Y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "操作已取消"
    exit 1
fi

# 创建孤儿分支
git checkout --orphan latest_branch

# 添加所有文件
git add -A

# 提交
git commit -m "Initial commit with current files"

# 删除目标分支（如果存在）
if git show-ref --verify --quiet refs/heads/$TARGET_BRANCH; then
    git branch -D $TARGET_BRANCH
fi

# 重命名当前分支为目标分支
git branch -m $TARGET_BRANCH

# 强制推送到远程
git push -f origin $TARGET_BRANCH

echo "✅ 分支 [$TARGET_BRANCH] 历史已重置并推送到远程。"
