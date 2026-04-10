#!/bin/bash
# CodingPlans-cn 每日检查脚本
# 运行时间：每日 00:00 UTC（北京时间 08:00）
# 功能：
#   1. 拉取最新代码
#   2. 检查 coding plan 数量是否匹配
#   3. 检查 models.json 与各 coding plan 的模型一致性
#   4. 检查是否有新增/下架模型
#   5. 自动提交变更并推送

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "=== CodingPlans Daily Check ==="
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# 1. 拉取最新代码
echo "[1/5] Pulling latest changes..."
git pull --rebase origin master

# 2. 统计 coding plan 数量
echo ""
echo "[2/5] Checking coding plan count..."
PLAN_COUNT=$(ls -1 data/*coding-plan.json 2>/dev/null | wc -l)
echo "Found $PLAN_COUNT coding plans:"
ls -1 data/*coding-plan.json | xargs -n1 basename | sed 's/-coding-plan.json//' | sed 's/^/  - /'

# 检查是否少于10个（当前标准数量）
if [ "$PLAN_COUNT" -lt 10 ]; then
    echo "⚠️ WARNING: Expected 10 coding plans, found $PLAN_COUNT"
    MISSING=$((10 - PLAN_COUNT))
    echo "Missing: $MISSING plan(s)"
fi

# 3. 检查 models.json 一致性
echo ""
echo "[3/5] Checking models.json consistency..."
python3 << 'PYTHON'
import json
import sys

# 读取所有 coding plan 的模型
plan_models = {}
for fname in [
    'alaya-code-coding-plan.json',
    'aliyun-bailian-coding-plan.json',
    'infini-ai-coding-plan.json',
    'jdcloud-coding-plan.json',
    'opencode-coding-plan.json',
    'qianfan-coding-plan.json',
    'tencent-coding-plan.json',
    'volcengine-coding-plan.json',
    'xfyun-astron-coding-plan.json',
    'xiaomi-mimo-coding-plan.json',
]:
    try:
        with open(f'data/{fname}') as f:
            data = json.load(f)
        provider = fname.replace('-coding-plan.json', '')
        models = data.get('models', [])
        # 处理 modelsByPlan（如讯飞星辰）
        if 'modelsByPlan' in data:
            all_models = set()
            for plan_models_list in data['modelsByPlan'].values():
                all_models.update(plan_models_list)
            models = list(all_models)
        plan_models[provider] = set(models)
    except Exception as e:
        print(f"  ⚠️ Error reading {fname}: {e}")

# 读取 models.json
with open('data/models.json') as f:
    data = json.load(f)
models_data = data if isinstance(data, dict) and 'models' not in data else data.get('models', [])

# 检查每个模型是否有 provider 字段
issues = []
for m in models_data:
    if not isinstance(m, dict):
        continue
    mid = m.get('id', '')
    providers = m.get('providers', [])
    
    # 检查哪些 coding plan 包含这个模型
    for plan_name, plan_model_set in plan_models.items():
        if mid in plan_model_set and plan_name not in providers:
            issues.append(f"  {mid}: missing provider '{plan_name}' in models.json")

if issues:
    print("⚠️ Inconsistencies found:")
    for issue in issues[:10]:  # 最多显示10个
        print(issue)
    if len(issues) > 10:
        print(f"  ... and {len(issues) - 10} more")
else:
    print("✅ All models consistent")

print(f"\nTotal models in models.json: {len([m for m in models_data if isinstance(m, dict)])}")
PYTHON

# 4. 检查是否有变更
echo ""
echo "[4/5] Checking for changes..."
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# 5. 提交并推送
echo ""
echo "[5/5] Committing and pushing..."
git add -A
git commit -m "chore: daily auto-update $(date -u '+%Y-%m-%d')"
git push origin master

echo ""
echo "✅ Daily check completed at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
