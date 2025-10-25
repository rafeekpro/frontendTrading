#!/bin/bash
# Sync all epics from frontend_mock to GitHub

set -e

cd .claude/epics/frontend_mock

echo "🚀 Syncing all epics for frontend_mock..."
echo ""

# Array to store epic numbers
declare -a epic_numbers=()

# Process each epic directory
for epic_dir in 0*-*/; do
  epic_name=$(basename "$epic_dir")
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📂 Processing: $epic_name"
  epic_file="$epic_dir/epic.md"

  if [ -f "$epic_file" ]; then
    # Extract content after frontmatter
    epic_content=$(awk 'BEGIN{p=0} /^---$/{p++; next} p==2{print}' "$epic_file")

    # Count tasks
    task_count=$(find "$epic_dir" -name "[0-9]*.md" -type f 2>/dev/null | wc -l | tr -d ' ')

    echo "  Tasks: $task_count"
    echo "  Creating epic issue..."

    # Create epic issue
    issue_url=$(gh issue create \
      --title "Epic: $epic_name" \
      --body "$epic_content

---
**Epic Statistics:**
- Tasks: $task_count
- Status: Planning
- Feature: frontend_mock
" \
      --label "epic,feature" 2>&1)

    # Extract issue number
    epic_number=$(echo "$issue_url" | grep -o '[0-9]*$')
    epic_numbers+=("$epic_number")

    echo "  ✅ Epic issue created: #$epic_number"
    echo "  Creating $task_count task issues..."

    # Create task issues
    task_files=$(find "$epic_dir" -name "[0-9]*.md" -type f | sort)
    task_num=0

    for task_file in $task_files; do
      task_num=$((task_num + 1))
      task_basename=$(basename "$task_file" .md)

      # Extract task content
      task_title=$(awk 'BEGIN{p=0} /^---$/{p++; next} p==2 && /^#/{gsub(/^# Task: /, ""); print; exit}' "$task_file")
      task_content=$(awk 'BEGIN{p=0} /^---$/{p++; next} p==2{print}' "$task_file")

      echo "    [$task_num/$task_count] $task_basename..."

      # Create task issue
      task_url=$(gh issue create \
        --title "Task: $task_title" \
        --body "$task_content

---
**Task Information:**
- Epic: #$epic_number
- Original ID: $task_basename
- Feature: frontend_mock/$epic_name
" \
        --label "task" 2>&1)

      task_number=$(echo "$task_url" | grep -o '[0-9]*$')
      echo "      ✅ #$task_number"
    done

    echo "  ✅ All tasks created for $epic_name"
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All epics synced successfully!"
echo ""
echo "📊 Summary:"
echo "  Feature: frontend_mock"
echo "  Epics created: ${#epic_numbers[@]}"
echo "  Epic issues: ${epic_numbers[*]}"
echo ""
echo "🔗 Repository: https://github.com/rafeekpro/frontendTrading"
echo ""
