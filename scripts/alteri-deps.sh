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
    echo "  --sync-stars        Pull starred GitHub repos into tracking"
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

    # Only sync from these 3 curated lists
    local target_lists=("Analytics" "NetworksCourses" "MAI")

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
    echo -e "${CYAN}Analytics tools:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "Analytics") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${CYAN}R Network packages:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "NetworksCourses") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${CYAN}AI/ML tools:${NC}"
    echo "$lists_data" | jq -r '
        .data.viewer.lists.nodes[] |
        select(.name == "MAI") |
        .items.nodes[] |
        "  - \(.nameWithOwner): \(.description // "–")"
    ' | head -5

    echo ""
    echo -e "${YELLOW}Run --ecosystem <name> to research specific tools before adding to manifest.${NC}"
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
