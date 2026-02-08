#!/bin/bash
# Alteri Dependency Tracking System
# Strategic visibility into active, evaluating, and tracked dependencies

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
DEPS_FILE="$REPO_ROOT/alteri-dependencies.json"

# Colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'  # Same as yellow (terminal limitation)
BOLD='\033[1m'
NC='\033[0m' # No colour

usage() {
    echo -e "${BOLD}Alteri Dependency Tracking${NC}"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo -e "${CYAN}Dependency Commands:${NC}"
    echo "  --list              Show all dependencies by category"
    echo "  --active            Show only active (in production) dependencies"
    echo "  --evaluating        Show dependencies being evaluated"
    echo "  --tracking          Show tracked candidates for future adoption"
    echo "  --check <name>      Check status of a specific dependency"
    echo "  --promote <name>    Move from evaluating → active"
    echo "  --archive <name>    Move from evaluating → tracking"
    echo "  --sync-linear       Pull dependency-tagged issues from Linear"
    echo "  --sync-stars        Pull from curated GitHub Lists into tracking"
    echo "  --sync-all-stars    Auto-capture ALL starred repos (discovers new stars)"
    echo "  --auto-update       Check for updates, auto-merge patches, PR minors"
    echo "  --ecosystem <name>  Search ecosystem for news/best practices"
    echo ""
    echo -e "${CYAN}Decision Commands (Linear-native):${NC}"
    echo "  --decisions         List all tool/approach decisions from Linear"
    echo "  --decision <id>     Show details of a specific decision (e.g., CIA-110)"
    echo "  --decisions-pending List decisions needing attention (pending/revisit)"
    echo "  --check-triggers    Scan for fired reassess triggers in descriptions"
    echo ""
    echo -e "${CYAN}Environment:${NC}"
    echo "  LINEAR_ACCESS_TOKEN  Required for decision commands"
    echo ""
    exit 1
}

check_deps_file() {
    if [[ ! -f "$DEPS_FILE" ]]; then
        echo -e "${RED}Error: $DEPS_FILE not found${NC}"
        exit 1
    fi
}

# List all dependencies grouped by ecosystem and status
list_all() {
    check_deps_file

    echo -e "${BOLD}=== Alteri Dependencies ===${NC}"
    echo -e "Last updated: $(jq -r '._meta.updated' "$DEPS_FILE")"
    echo ""

    for ecosystem in javascript r services mcp; do
        echo -e "${BOLD}${CYAN}[$ecosystem]${NC}"

        # Active
        local active_count
        active_count=$(jq -r ".$ecosystem.active | keys | length" "$DEPS_FILE")
        if [[ "$active_count" -gt 0 ]]; then
            echo -e "  ${GREEN}Active ($active_count):${NC}"
            jq -r ".$ecosystem.active | to_entries[] | \"    ✓ \\(.key): \\(.value.purpose // .value.version // \"–\")\"" "$DEPS_FILE" | while read -r line; do
                echo -e "    ${GREEN}$line${NC}"
            done
        fi

        # Evaluating
        local eval_count
        eval_count=$(jq -r ".$ecosystem.evaluating | keys | length" "$DEPS_FILE")
        if [[ "$eval_count" -gt 0 ]]; then
            echo -e "  ${YELLOW}Evaluating ($eval_count):${NC}"
            jq -r ".$ecosystem.evaluating | to_entries[] | \"    ◉ \\(.key): \\(.value.purpose // .value.notes // \"–\")\"" "$DEPS_FILE" | while read -r line; do
                echo -e "    ${YELLOW}$line${NC}"
            done
        fi

        # Tracking
        local track_count
        track_count=$(jq -r ".$ecosystem.tracking | keys | length" "$DEPS_FILE")
        if [[ "$track_count" -gt 0 ]]; then
            echo -e "  ${BLUE}Tracking ($track_count):${NC}"
            jq -r ".$ecosystem.tracking | to_entries[] | \"    ○ \\(.key): \\(.value.purpose // .value.source // \"–\")\"" "$DEPS_FILE" | while read -r line; do
                echo -e "    ${BLUE}$line${NC}"
            done
        fi

        echo ""
    done
}

# Show only active dependencies
show_active() {
    check_deps_file

    echo -e "${BOLD}${GREEN}=== Active Dependencies ===${NC}"
    echo ""

    for ecosystem in javascript r services mcp; do
        local count
        count=$(jq -r ".$ecosystem.active | keys | length" "$DEPS_FILE")
        if [[ "$count" -gt 0 ]]; then
            echo -e "${CYAN}[$ecosystem]${NC}"
            jq -r ".$ecosystem.active | to_entries[] | \"  ✓ \(.key): \(.value.purpose // .value.version // \"–\")\"" "$DEPS_FILE"
            echo ""
        fi
    done
}

# Show evaluating dependencies
show_evaluating() {
    check_deps_file

    echo -e "${BOLD}${YELLOW}=== Evaluating Dependencies ===${NC}"
    echo ""

    for ecosystem in javascript r services mcp; do
        local count
        count=$(jq -r ".$ecosystem.evaluating | keys | length" "$DEPS_FILE")
        if [[ "$count" -gt 0 ]]; then
            echo -e "${CYAN}[$ecosystem]${NC}"
            jq -r ".$ecosystem.evaluating | to_entries[] | \"  ◉ \(.key): \(.value.notes // .value.purpose // \"–\")\"" "$DEPS_FILE"
            echo ""
        fi
    done

    local total
    total=$(jq '[.javascript.evaluating, .r.evaluating, .services.evaluating, .mcp.evaluating] | map(keys | length) | add' "$DEPS_FILE")
    if [[ "$total" -eq 0 ]]; then
        echo "No dependencies currently being evaluated."
    fi
}

# Show tracking dependencies
show_tracking() {
    check_deps_file

    echo -e "${BOLD}${BLUE}=== Tracked Dependencies ===${NC}"
    echo ""

    for ecosystem in javascript r services mcp; do
        local count
        count=$(jq -r ".$ecosystem.tracking | keys | length" "$DEPS_FILE")
        if [[ "$count" -gt 0 ]]; then
            echo -e "${CYAN}[$ecosystem]${NC}"
            jq -r ".$ecosystem.tracking | to_entries[] | \"  ○ \(.key): \(.value.source // .value.purpose // \"–\")\"" "$DEPS_FILE"
            echo ""
        fi
    done

    local total
    total=$(jq '[.javascript.tracking, .r.tracking, .services.tracking, .mcp.tracking] | map(keys | length) | add' "$DEPS_FILE")
    if [[ "$total" -eq 0 ]]; then
        echo "No dependencies currently being tracked."
        echo "Run --sync-linear or --sync-stars to populate."
    fi
}

# Check a specific dependency
check_dep() {
    local name="$1"
    check_deps_file

    echo -e "${BOLD}=== Checking: $name ===${NC}"
    echo ""

    local found=false

    for ecosystem in javascript r services mcp; do
        for status in active evaluating tracking; do
            local info
            info=$(jq -r ".$ecosystem.$status[\"$name\"] // empty" "$DEPS_FILE")
            if [[ -n "$info" ]]; then
                found=true
                local status_colour
                case "$status" in
                    active) status_colour="${GREEN}ACTIVE${NC}" ;;
                    evaluating) status_colour="${YELLOW}EVALUATING${NC}" ;;
                    tracking) status_colour="${BLUE}TRACKING${NC}" ;;
                esac

                echo -e "Ecosystem: ${CYAN}$ecosystem${NC}"
                echo -e "Status: $status_colour"
                echo ""
                echo "$info" | jq -r 'to_entries[] | "  \(.key): \(.value)"'
            fi
        done
    done

    if [[ "$found" == "false" ]]; then
        echo -e "${RED}Not found in dependency manifest.${NC}"
        echo ""
        echo "To add it, edit $DEPS_FILE manually or use --sync-* commands."
    fi
}

# Promote a dependency from evaluating to active
promote_dep() {
    local name="$1"
    check_deps_file

    local found=false

    for ecosystem in javascript r services mcp; do
        local info
        info=$(jq -r ".$ecosystem.evaluating[\"$name\"] // empty" "$DEPS_FILE")
        if [[ -n "$info" ]]; then
            found=true

            # Move from evaluating to active
            local tmp_file
            tmp_file=$(mktemp)
            jq ".$ecosystem.active[\"$name\"] = .$ecosystem.evaluating[\"$name\"] | del(.$ecosystem.evaluating[\"$name\"]) | ._meta.updated = \"$(date +%Y-%m-%d)\"" "$DEPS_FILE" > "$tmp_file"
            mv "$tmp_file" "$DEPS_FILE"

            echo -e "${GREEN}✓ Promoted '$name' from evaluating → active in $ecosystem${NC}"
            return
        fi
    done

    if [[ "$found" == "false" ]]; then
        echo -e "${RED}Error: '$name' not found in evaluating status${NC}"
        exit 1
    fi
}

# Archive a dependency from evaluating to tracking
archive_dep() {
    local name="$1"
    check_deps_file

    local found=false

    for ecosystem in javascript r services mcp; do
        local info
        info=$(jq -r ".$ecosystem.evaluating[\"$name\"] // empty" "$DEPS_FILE")
        if [[ -n "$info" ]]; then
            found=true

            # Move from evaluating to tracking
            local tmp_file
            tmp_file=$(mktemp)
            jq ".$ecosystem.tracking[\"$name\"] = (.$ecosystem.evaluating[\"$name\"] + {\"archived\": \"$(date +%Y-%m-%d)\"}) | del(.$ecosystem.evaluating[\"$name\"]) | ._meta.updated = \"$(date +%Y-%m-%d)\"" "$DEPS_FILE" > "$tmp_file"
            mv "$tmp_file" "$DEPS_FILE"

            echo -e "${YELLOW}→ Archived '$name' from evaluating → tracking in $ecosystem${NC}"
            return
        fi
    done

    if [[ "$found" == "false" ]]; then
        echo -e "${RED}Error: '$name' not found in evaluating status${NC}"
        exit 1
    fi
}

# Sync from Linear issues
sync_linear() {
    check_deps_file

    echo -e "${BOLD}=== Syncing from Linear ===${NC}"
    echo ""

    # Check for Linear API key
    if [[ -z "${LINEAR_API_KEY:-}" ]]; then
        echo -e "${YELLOW}LINEAR_API_KEY not set. Attempting to use linear CLI...${NC}"
    fi

    # Query Linear for issues with dependency-related labels
    # Using gh-style API query (Linear MCP or direct API)
    local issues
    issues=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: ${LINEAR_API_KEY:-}" \
        --data '{
            "query": "query { issues(filter: { labels: { name: { in: [\"dependencies\", \"tooling\", \"research\"] } }, team: { key: { eq: \"CIA\" } } }) { nodes { identifier title description labels { nodes { name } } } } }"
        }' \
        https://api.linear.app/graphql 2>/dev/null || echo "{}")

    if [[ "$issues" == "{}" ]] || [[ -z "$issues" ]]; then
        echo -e "${YELLOW}Could not fetch from Linear API.${NC}"
        echo "Ensure LINEAR_API_KEY is set or use Linear MCP directly."
        echo ""
        echo "Manual alternative: Tag Linear issues with 'dependencies' label"
        echo "and they will appear here on next sync."
        return
    fi

    local count
    count=$(echo "$issues" | jq '.data.issues.nodes | length' 2>/dev/null || echo "0")

    if [[ "$count" -gt 0 ]]; then
        echo -e "${GREEN}Found $count dependency-related issues${NC}"
        echo ""
        echo "$issues" | jq -r '.data.issues.nodes[] | "  \(.identifier): \(.title)"'

        # TODO: Parse and add to tracking section
        echo ""
        echo -e "${YELLOW}Note: Auto-parsing not yet implemented. Review issues manually.${NC}"
    else
        echo "No dependency-tagged issues found in Linear."
    fi
}

# Sync from GitHub Lists (not all stars)
sync_stars() {
    check_deps_file

    echo -e "${BOLD}=== Syncing from GitHub Lists ===${NC}"
    echo ""

    # Check for gh CLI
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: gh CLI not installed${NC}"
        exit 1
    fi

    # Sync from curated GitHub Lists (use actual list names)
    local target_lists=("BI & Analytics" "Networks & R" "Alteri" "NotebookLM & Zotero")

    echo "Fetching GitHub Lists via GraphQL..."
    echo ""

    # Query all lists with their items
    local lists_data
    lists_data=$(gh api graphql -f query='{ viewer { lists(first: 10) { nodes { name items(first: 30) { nodes { ... on Repository { nameWithOwner description url stargazerCount primaryLanguage { name } } } } } } } }' 2>/dev/null || echo "{}")

    if [[ "$lists_data" == "{}" ]] || [[ -z "$lists_data" ]]; then
        echo -e "${YELLOW}Could not fetch GitHub Lists.${NC}"
        echo "Ensure you're authenticated with 'gh auth login'."
        return
    fi

    local total_repos=0

    for list_name in "${target_lists[@]}"; do
        echo -e "${CYAN}[$list_name]${NC}"

        # Extract repos for this list
        local repos
        repos=$(echo "$lists_data" | jq -r --arg name "$list_name" '
            .data.viewer.lists.nodes[] |
            select(.name == $name) |
            .items.nodes[] |
            "  ★ \(.nameWithOwner) (\(.stargazerCount) stars)\n    \(.description // "No description")\n    \(.url)"
        ')

        if [[ -n "$repos" ]]; then
            echo "$repos"
            local count
            count=$(echo "$lists_data" | jq --arg name "$list_name" '[.data.viewer.lists.nodes[] | select(.name == $name) | .items.nodes[]] | length')
            total_repos=$((total_repos + count))
        else
            echo "  (empty or not found)"
        fi
        echo ""
    done

    echo -e "${GREEN}Total: $total_repos repos across ${#target_lists[@]} lists${NC}"
    echo ""

    # Offer to update manifest
    echo -e "${BOLD}Key findings for tracking:${NC}"

    # Extract notable repos for each category
    echo -e "${CYAN}BI & Analytics:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "BI & Analytics") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${CYAN}Networks & R:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "Networks & R") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${CYAN}Alteri-specific:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "Alteri") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${CYAN}NotebookLM & Zotero:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "NotebookLM & Zotero") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${YELLOW}Run --ecosystem <name> to research specific tools before adding to manifest.${NC}"
}

# Sync ALL starred repos (automatic capture of new stars)
sync_all_stars() {
    check_deps_file

    echo -e "${BOLD}=== Syncing ALL Starred Repos ===${NC}"
    echo ""

    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: gh CLI not installed${NC}"
        exit 1
    fi

    echo "Fetching all starred repositories..."
    echo ""

    # Get all starred repos with metadata
    local starred_repos
    starred_repos=$(gh api user/starred --paginate --jq '.[] | {
        name: .full_name,
        description: (.description // "No description"),
        language: (.language // "unknown"),
        stars: .stargazers_count,
        url: .html_url,
        topics: .topics
    }' 2>/dev/null)

    if [[ -z "$starred_repos" ]]; then
        echo -e "${YELLOW}Could not fetch starred repos.${NC}"
        return
    fi

    # Get currently tracked repos from manifest (all categories, all statuses)
    local existing_repos
    existing_repos=$(jq -r '
        [
            (.javascript.active // {} | to_entries[] | .value.repo // .key),
            (.javascript.evaluating // {} | to_entries[] | .value.repo // .key),
            (.javascript.tracking // {} | to_entries[] | .value.repo // .key),
            (.r.active // {} | to_entries[] | .value.repo // .key),
            (.r.evaluating // {} | to_entries[] | .value.repo // .key),
            (.r.tracking // {} | to_entries[] | .value.repo // .key),
            (.services.active // {} | to_entries[] | .value.repo // .key),
            (.services.evaluating // {} | to_entries[] | .value.repo // .key),
            (.services.tracking // {} | to_entries[] | .value.repo // .key),
            (.mcp.active // {} | to_entries[] | .value.repo // .key),
            (.mcp.evaluating // {} | to_entries[] | .value.repo // .key),
            (.mcp.tracking // {} | to_entries[] | .value.repo // .key)
        ] | .[]
    ' "$DEPS_FILE" 2>/dev/null | tr '[:upper:]' '[:lower:]' | sort | uniq)

    local added=0
    local skipped=0
    local new_repos=""

    echo -e "${CYAN}Categorising by language/topic...${NC}"
    echo ""

    while IFS= read -r repo_json; do
        [[ -z "$repo_json" ]] && continue

        local name=$(echo "$repo_json" | jq -r '.name')
        local name_lower=$(echo "$name" | tr '[:upper:]' '[:lower:]')
        local language=$(echo "$repo_json" | jq -r '.language')
        local description=$(echo "$repo_json" | jq -r '.description')
        local stars=$(echo "$repo_json" | jq -r '.stars')
        local topics=$(echo "$repo_json" | jq -r '.topics | join(",")')

        # Check if already tracked (by full repo name)
        if echo "$existing_repos" | grep -qF "$name_lower"; then
            ((skipped++))
            continue
        fi

        # Categorise by language and topics
        local category="services"  # default
        case "$language" in
            TypeScript|JavaScript)
                if [[ "$topics" == *"mcp"* ]] || [[ "$name" == *"mcp"* ]]; then
                    category="mcp"
                else
                    category="javascript"
                fi
                ;;
            R)
                category="r"
                ;;
            Python)
                if [[ "$topics" == *"mcp"* ]] || [[ "$name" == *"mcp"* ]]; then
                    category="mcp"
                else
                    category="services"
                fi
                ;;
            *)
                if [[ "$topics" == *"mcp"* ]] || [[ "$name" == *"mcp"* ]]; then
                    category="mcp"
                fi
                ;;
        esac

        # Add to new repos list
        new_repos="${new_repos}${category}|${name}|${description}|${stars}\n"
        ((added++))

    done < <(echo "$starred_repos" | jq -c '.')

    # Report findings
    echo -e "${BOLD}Summary:${NC}"
    echo -e "  ${GREEN}New repos found:${NC} $added"
    echo -e "  ${YELLOW}Already tracked:${NC} $skipped"
    echo ""

    if [[ $added -gt 0 ]]; then
        echo -e "${BOLD}New repos to add (by category):${NC}"
        echo ""

        for cat in javascript r services mcp; do
            local cat_repos=$(echo -e "$new_repos" | grep "^${cat}|" | head -10)
            if [[ -n "$cat_repos" ]]; then
                echo -e "${CYAN}[$cat]${NC}"
                echo "$cat_repos" | while IFS='|' read -r _ name desc stars; do
                    echo -e "  ${GREEN}+${NC} $name (${stars} ★)"
                    echo "    $desc" | head -c 80
                    echo ""
                done
                echo ""
            fi
        done

        echo -e "${YELLOW}To add these to tracking, run:${NC}"
        echo "  $0 --add-starred"
    else
        echo -e "${GREEN}All starred repos are already tracked!${NC}"
    fi
}

# Auto-update: check for updates and create PRs/issues based on semver
auto_update() {
    check_deps_file

    echo -e "${BOLD}=== Auto-Update Check ===${NC}"
    echo ""

    local repo_root
    repo_root=$(dirname "$(dirname "$DEPS_FILE")")

    # Check if we're in a git repo
    if ! git -C "$repo_root" rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Error: Not in a git repository${NC}"
        exit 1
    fi

    echo -e "${CYAN}Checking npm dependencies...${NC}"
    echo ""

    local package_json="$repo_root/package.json"
    if [[ ! -f "$package_json" ]]; then
        echo -e "${YELLOW}No package.json found${NC}"
        return
    fi

    # Get outdated packages
    local outdated
    outdated=$(cd "$repo_root" && pnpm outdated --format json 2>/dev/null || npm outdated --json 2>/dev/null || echo "{}")

    if [[ "$outdated" == "{}" ]] || [[ -z "$outdated" ]]; then
        echo -e "${GREEN}All npm packages up to date!${NC}"
    else
        local patch_updates=""
        local minor_updates=""
        local major_updates=""

        # Parse outdated packages
        echo "$outdated" | jq -r 'to_entries[] | "\(.key)|\(.value.current // "?")|\(.value.latest // "?")"' 2>/dev/null | while IFS='|' read -r pkg current latest; do
            [[ -z "$pkg" ]] && continue

            # Determine update type based on semver
            local current_major current_minor latest_major latest_minor
            current_major=$(echo "$current" | cut -d'.' -f1 | tr -d '^~')
            current_minor=$(echo "$current" | cut -d'.' -f2)
            latest_major=$(echo "$latest" | cut -d'.' -f1)
            latest_minor=$(echo "$latest" | cut -d'.' -f2)

            if [[ "$latest_major" != "$current_major" ]]; then
                echo -e "  ${RED}MAJOR${NC} $pkg: $current → $latest"
                major_updates="${major_updates}${pkg}|${current}|${latest}\n"
            elif [[ "$latest_minor" != "$current_minor" ]]; then
                echo -e "  ${YELLOW}MINOR${NC} $pkg: $current → $latest"
                minor_updates="${minor_updates}${pkg}|${current}|${latest}\n"
            else
                echo -e "  ${GREEN}PATCH${NC} $pkg: $current → $latest"
                patch_updates="${patch_updates}${pkg}|${current}|${latest}\n"
            fi
        done

        echo ""
        echo -e "${BOLD}Auto-Update Actions:${NC}"
        echo ""

        # Handle PATCH updates: auto-create branch, update, test, merge
        if [[ -n "$patch_updates" ]]; then
            echo -e "${GREEN}PATCH updates (auto-merge if tests pass):${NC}"
            local branch_name="deps/patch-updates-$(date +%Y%m%d)"

            echo "  Creating branch: $branch_name"
            git -C "$repo_root" checkout -b "$branch_name" 2>/dev/null || true

            echo "  Running: pnpm update (patch only)"
            (cd "$repo_root" && pnpm update 2>/dev/null) || true

            echo "  Running tests..."
            local test_result=0
            (cd "$repo_root" && pnpm test 2>/dev/null) || test_result=$?

            if [[ $test_result -eq 0 ]]; then
                echo -e "  ${GREEN}✓${NC} Tests passed"
                echo "  Committing changes..."
                git -C "$repo_root" add package.json pnpm-lock.yaml 2>/dev/null
                git -C "$repo_root" commit -m "deps: patch updates $(date +%Y-%m-%d)

Auto-merged by alteri-deps.sh --auto-update" 2>/dev/null

                echo "  Pushing and creating PR with auto-merge label..."
                git -C "$repo_root" push -u origin "$branch_name" 2>/dev/null

                gh pr create \
                    --repo "$(git -C "$repo_root" remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')" \
                    --title "deps: patch updates $(date +%Y-%m-%d)" \
                    --body "Automated patch updates.

## Changes
$(echo -e "$patch_updates" | while IFS='|' read -r pkg cur lat; do echo "- $pkg: $cur → $lat"; done)

## Auto-merge
This PR will be auto-merged if CI passes.

---
*Created by \`alteri-deps.sh --auto-update\`*" \
                    --label "dependencies,auto-merge" 2>/dev/null || echo "  PR creation requires gh auth"
            else
                echo -e "  ${RED}✗${NC} Tests failed - reverting"
                git -C "$repo_root" checkout main 2>/dev/null
                git -C "$repo_root" branch -D "$branch_name" 2>/dev/null
            fi
        fi

        # Handle MINOR updates: create PR, wait for CI
        if [[ -n "$minor_updates" ]]; then
            echo ""
            echo -e "${YELLOW}MINOR updates (PR + CI, auto-merge if green):${NC}"
            echo "  Creating Linear issue with exec:quick label..."

            # Create Linear issue for minor updates
            if [[ -n "$LINEAR_ACCESS_TOKEN" ]]; then
                local issue_title="deps: minor updates $(date +%Y-%m-%d)"
                local issue_body="Minor dependency updates detected.

## Packages
$(echo -e "$minor_updates" | while IFS='|' read -r pkg cur lat; do echo "- $pkg: $cur → $lat"; done)

## Action
Review changelogs and merge if safe."

                curl -s -X POST https://api.linear.app/graphql \
                    -H "Authorization: $LINEAR_ACCESS_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d "{\"query\": \"mutation { issueCreate(input: { title: \\\"$issue_title\\\", description: \\\"$issue_body\\\", teamId: \\\"YOUR_TEAM_ID\\\", labelIds: [\\\"exec:quick\\\"] }) { success } }\"}" \
                    2>/dev/null | jq -r '.data.issueCreate.success' || echo "  Linear issue creation failed"
            else
                echo "  LINEAR_ACCESS_TOKEN not set - skipping Linear issue"
            fi
        fi

        # Handle MAJOR updates: create Linear issue with decision:pending
        if [[ -n "$major_updates" ]]; then
            echo ""
            echo -e "${RED}MAJOR updates (manual review required):${NC}"
            echo "  Creating Linear issue with decision:pending label..."

            if [[ -n "$LINEAR_ACCESS_TOKEN" ]]; then
                local issue_title="decision: major dependency updates $(date +%Y-%m-%d)"
                local issue_body="⚠️ Major dependency updates require manual review.

## Breaking Changes Possible
$(echo -e "$major_updates" | while IFS='|' read -r pkg cur lat; do echo "- **$pkg**: $cur → $lat"; done)

## Action Required
1. Review changelogs for breaking changes
2. Test locally before merging
3. Update code if API changes"

                curl -s -X POST https://api.linear.app/graphql \
                    -H "Authorization: $LINEAR_ACCESS_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d "{\"query\": \"mutation { issueCreate(input: { title: \\\"$issue_title\\\", description: \\\"$issue_body\\\", teamId: \\\"YOUR_TEAM_ID\\\", labelIds: [\\\"decision:pending\\\"] }) { success } }\"}" \
                    2>/dev/null | jq -r '.data.issueCreate.success' || echo "  Linear issue creation failed"
            else
                echo "  LINEAR_ACCESS_TOKEN not set - skipping Linear issue"
            fi
        fi
    fi

    # Return to main branch
    git -C "$repo_root" checkout main 2>/dev/null || git -C "$repo_root" checkout master 2>/dev/null

    echo ""
    echo -e "${BOLD}Summary:${NC}"
    echo "  Patch: auto-merge if tests pass"
    echo "  Minor: PR created, auto-merge after CI"
    echo "  Major: Linear issue created for manual review"
}

# Ecosystem intelligence search
ecosystem_search() {
    local name="$1"
    check_deps_file

    echo -e "${BOLD}=== Ecosystem Intelligence: $name ===${NC}"
    echo ""

    # URL-encode the name
    local encoded_name
    encoded_name=$(echo "$name" | sed 's/ /%20/g')

    # 1. Hacker News search
    echo -e "${CYAN}[Hacker News]${NC}"
    local hn_results
    hn_results=$(curl -s "https://hn.algolia.com/api/v1/search?query=$encoded_name&tags=story&hitsPerPage=5" 2>/dev/null || echo "{}")

    local hn_count
    hn_count=$(echo "$hn_results" | jq '.hits | length' 2>/dev/null || echo "0")

    if [[ "$hn_count" -gt 0 ]]; then
        echo "$hn_results" | jq -r '.hits[] | "  ↗ \(.title) (\(.points) points)\n    https://news.ycombinator.com/item?id=\(.objectID)\n"'
    else
        echo "  No recent HN discussions found."
    fi
    echo ""

    # 2. GitHub search for repos using this dependency
    echo -e "${CYAN}[GitHub - Trending Usage]${NC}"
    if command -v gh &> /dev/null; then
        local gh_results
        gh_results=$(gh api "search/repositories?q=$encoded_name+in:readme+language:typescript&sort=stars&per_page=5" 2>/dev/null || echo "{}")

        local gh_count
        gh_count=$(echo "$gh_results" | jq '.items | length' 2>/dev/null || echo "0")

        if [[ "$gh_count" -gt 0 ]]; then
            echo "$gh_results" | jq -r '.items[] | "  ★ \(.full_name) (\(.stargazers_count) stars)\n    \(.description // "No description")\n    \(.html_url)\n"'
        else
            echo "  No trending repos found."
        fi
    else
        echo "  gh CLI not available. Install for GitHub search."
    fi
    echo ""

    # 3. GitHub Discussions/Issues for the project itself
    echo -e "${CYAN}[GitHub - Recent Activity]${NC}"
    if command -v gh &> /dev/null; then
        # Try to find the main repo
        local repo_search
        repo_search=$(gh api "search/repositories?q=$encoded_name&per_page=1" 2>/dev/null || echo "{}")
        local main_repo
        main_repo=$(echo "$repo_search" | jq -r '.items[0].full_name // empty')

        if [[ -n "$main_repo" ]]; then
            echo "  Main repo: $main_repo"
            echo ""

            # Get recent issues
            local issues
            issues=$(gh api "repos/$main_repo/issues?state=open&per_page=5&sort=updated" 2>/dev/null || echo "[]")
            local issue_count
            issue_count=$(echo "$issues" | jq 'length')

            if [[ "$issue_count" -gt 0 ]]; then
                echo "  Recent issues:"
                echo "$issues" | jq -r '.[] | "    #\(.number): \(.title)"'
            fi
        else
            echo "  Could not identify main repository."
        fi
    fi
    echo ""

    echo -e "${BOLD}Tip:${NC} For deeper research, check:"
    echo "  - Official docs/blog"
    echo "  - Discord/Slack communities"
    echo "  - X/Twitter: @$name or #$name"
    echo "  - Reddit: r/reactjs, r/rstats, r/webdev"
}

# =============================================================================
# DECISION TRACKING (Linear-native)
# =============================================================================

# Linear API configuration
LINEAR_API_URL="https://api.linear.app/graphql"
LINEAR_TOKEN="${LINEAR_ACCESS_TOKEN:-}"

linear_query() {
    local query="$1"
    if [[ -z "$LINEAR_TOKEN" ]]; then
        echo -e "${RED}Error: LINEAR_ACCESS_TOKEN not set${NC}"
        echo "Set it via: export LINEAR_ACCESS_TOKEN=lin_api_..."
        exit 1
    fi

    local tmp_file
    tmp_file=$(mktemp)
    echo "{\"query\": \"$query\"}" > "$tmp_file"

    curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: $LINEAR_TOKEN" \
        -d @"$tmp_file" \
        "$LINEAR_API_URL"

    rm -f "$tmp_file"
}

# List all decision issues from Linear
list_decisions() {
    echo -e "${BOLD}=== Tool/Approach Decisions (from Linear) ===${NC}"
    echo ""

    local query='query { issues(filter: { labels: { name: { eq: \"decision\" } }, team: { key: { eq: \"CIA\" } } }) { nodes { identifier title state { name } labels { nodes { name } } } } }'
    local result
    result=$(linear_query "$query")

    if [[ -z "$result" ]] || echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}Error querying Linear${NC}"
        echo "$result" | jq '.errors[0].message' 2>/dev/null
        return 1
    fi

    local count
    count=$(echo "$result" | jq '.data.issues.nodes | length')
    echo -e "Found ${CYAN}$count${NC} decision issues"
    echo ""

    # Group by decision status
    echo -e "${YELLOW}Pending (need decision):${NC}"
    echo "$result" | jq -r '.data.issues.nodes[] | select(.labels.nodes | map(.name) | contains(["decision:pending"])) | "  ◉ \(.identifier): \(.title)"'
    echo ""

    echo -e "${ORANGE}Revisit (reassess needed):${NC}"
    echo "$result" | jq -r '.data.issues.nodes[] | select(.labels.nodes | map(.name) | contains(["decision:revisit"])) | "  ⚠ \(.identifier): \(.title)"'
    echo ""

    echo -e "${GREEN}Decided:${NC}"
    echo "$result" | jq -r '.data.issues.nodes[] | select(.labels.nodes | map(.name) | contains(["decision:decided"])) | "  ✓ \(.identifier): \(.title)"'
}

# Show details of a specific decision issue
show_decision() {
    local issue_id="$1"
    local issue_num="${issue_id#CIA-}"

    echo -e "${BOLD}=== Decision: $issue_id ===${NC}"
    echo ""

    local query="query { issues(filter: { number: { eq: $issue_num }, team: { key: { eq: \\\"CIA\\\" } } }) { nodes { identifier title description state { name } labels { nodes { name } } comments { nodes { body createdAt } } } } }"
    local result
    result=$(linear_query "$query")

    if [[ -z "$result" ]] || echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}Error querying Linear${NC}"
        return 1
    fi

    local issue
    issue=$(echo "$result" | jq '.data.issues.nodes[0]')

    if [[ "$issue" == "null" ]]; then
        echo -e "${RED}Issue $issue_id not found${NC}"
        return 1
    fi

    echo -e "${CYAN}Title:${NC} $(echo "$issue" | jq -r '.title')"
    echo -e "${CYAN}Status:${NC} $(echo "$issue" | jq -r '.state.name')"
    echo -e "${CYAN}Labels:${NC} $(echo "$issue" | jq -r '[.labels.nodes[].name] | join(", ")')"
    echo ""
    echo -e "${CYAN}Description:${NC}"
    echo "$issue" | jq -r '.description' | head -50
    echo ""

    local comment_count
    comment_count=$(echo "$issue" | jq '.comments.nodes | length')
    if [[ "$comment_count" -gt 0 ]]; then
        echo -e "${CYAN}Recent comments ($comment_count):${NC}"
        echo "$issue" | jq -r '.comments.nodes[-3:][] | "---\n\(.body)\n"'
    fi

    echo ""
    echo -e "${BOLD}View in Linear:${NC} https://linear.app/cian-claude/issue/$issue_id"
}

# List decisions needing attention (pending or revisit)
list_decisions_pending() {
    echo -e "${BOLD}=== Decisions Needing Attention ===${NC}"
    echo ""

    local query='query { issues(filter: { labels: { or: [{ name: { eq: \"decision:pending\" } }, { name: { eq: \"decision:revisit\" } }] }, team: { key: { eq: \"CIA\" } } }) { nodes { identifier title labels { nodes { name } } } } }'
    local result
    result=$(linear_query "$query")

    if [[ -z "$result" ]] || echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}Error querying Linear${NC}"
        return 1
    fi

    local count
    count=$(echo "$result" | jq '.data.issues.nodes | length')

    if [[ "$count" -eq 0 ]]; then
        echo -e "${GREEN}No decisions need immediate attention${NC}"
        return 0
    fi

    echo -e "Found ${YELLOW}$count${NC} decisions needing attention:"
    echo ""

    echo "$result" | jq -r '.data.issues.nodes[] |
        if (.labels.nodes | map(.name) | contains(["decision:revisit"])) then
            "  ⚠️  \(.identifier): \(.title) [REVISIT]"
        else
            "  ◉  \(.identifier): \(.title) [PENDING]"
        end'
}

# Check for fired reassess triggers (parses issue descriptions)
check_triggers() {
    echo -e "${BOLD}=== Checking Reassess Triggers ===${NC}"
    echo ""

    # Get all decision issues with their descriptions
    local query='query { issues(filter: { labels: { name: { eq: \"decision\" } }, team: { key: { eq: \"CIA\" } } }) { nodes { identifier title description labels { nodes { name } } } } }'
    local result
    result=$(linear_query "$query")

    if [[ -z "$result" ]] || echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}Error querying Linear${NC}"
        return 1
    fi

    echo "Scanning issue descriptions for checked trigger boxes..."
    echo ""

    local fired_count=0

    # Parse each issue for checked checkboxes in Reassess Triggers section
    while IFS= read -r issue; do
        local id title desc
        id=$(echo "$issue" | jq -r '.identifier')
        title=$(echo "$issue" | jq -r '.title')
        desc=$(echo "$issue" | jq -r '.description')

        # Look for checked boxes [x] after "Reassess Triggers" or "Decision Trigger"
        if echo "$desc" | grep -qi "reassess\|trigger"; then
            local checked
            checked=$(echo "$desc" | grep -oE '\[x\][^\n]+' | head -3)
            if [[ -n "$checked" ]]; then
                echo -e "${YELLOW}⚠️  $id:${NC} $title"
                echo "   Fired triggers:"
                echo "$checked" | while read -r line; do
                    echo "     ✓ ${line#\[x\] }"
                done
                echo ""
                fired_count=$((fired_count + 1))
            fi
        fi
    done < <(echo "$result" | jq -c '.data.issues.nodes[]')

    if [[ "$fired_count" -eq 0 ]]; then
        echo -e "${GREEN}No fired triggers detected${NC}"
    else
        echo -e "${YELLOW}Found $fired_count issue(s) with potential fired triggers${NC}"
        echo "Review these issues and update labels if needed (decision:pending → decision:revisit)"
    fi
}

# Main
if [[ $# -lt 1 ]]; then
    usage
fi

case "$1" in
    --list)
        list_all
        ;;
    --active)
        show_active
        ;;
    --evaluating)
        show_evaluating
        ;;
    --tracking)
        show_tracking
        ;;
    --check)
        if [[ $# -lt 2 ]]; then
            echo -e "${RED}Error: --check requires a dependency name${NC}"
            exit 1
        fi
        check_dep "$2"
        ;;
    --promote)
        if [[ $# -lt 2 ]]; then
            echo -e "${RED}Error: --promote requires a dependency name${NC}"
            exit 1
        fi
        promote_dep "$2"
        ;;
    --archive)
        if [[ $# -lt 2 ]]; then
            echo -e "${RED}Error: --archive requires a dependency name${NC}"
            exit 1
        fi
        archive_dep "$2"
        ;;
    --sync-linear)
        sync_linear
        ;;
    --sync-stars)
        sync_stars
        ;;
    --sync-all-stars)
        sync_all_stars
        ;;
    --auto-update)
        auto_update
        ;;
    --ecosystem)
        if [[ $# -lt 2 ]]; then
            echo -e "${RED}Error: --ecosystem requires a dependency name${NC}"
            exit 1
        fi
        ecosystem_search "$2"
        ;;
    --decisions)
        list_decisions
        ;;
    --decision)
        if [[ $# -lt 2 ]]; then
            echo -e "${RED}Error: --decision requires an issue ID (e.g., CIA-110)${NC}"
            exit 1
        fi
        show_decision "$2"
        ;;
    --decisions-pending)
        list_decisions_pending
        ;;
    --check-triggers)
        check_triggers
        ;;
    *)
        usage
        ;;
esac
