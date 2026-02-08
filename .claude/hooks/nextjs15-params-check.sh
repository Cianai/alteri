#!/bin/bash
# Next.js 15 Async Params Validator
# Warns when page.tsx files access params/searchParams without await
#
# Next.js 15 Breaking Change: params and searchParams are now Promises
# https://nextjs.org/docs/app/building-your-application/upgrading/version-15

# Read tool input from stdin
INPUT=$(cat)

# Extract file path from JSON input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

# Only check page.tsx files in the app directory
if [[ "$FILE_PATH" =~ apps/web/app.*page\.tsx$ ]]; then
    # Check if file exists and is readable
    if [[ -f "$FILE_PATH" ]]; then
        # Look for params/searchParams usage patterns that should be awaited

        # Pattern 1: Destructuring params without await
        # e.g., const { slug } = params (should be: const { slug } = await params)
        if grep -qE '(const|let|var)\s*\{[^}]+\}\s*=\s*(params|searchParams)\s*[^)]' "$FILE_PATH" 2>/dev/null; then
            if ! grep -qE 'await\s+(params|searchParams)' "$FILE_PATH" 2>/dev/null; then
                echo "⚠️  WARNING: Next.js 15 requires 'await' for params/searchParams"
                echo "   File: $FILE_PATH"
                echo "   Fix: Change 'const { x } = params' to 'const { x } = await params'"
                echo ""
            fi
        fi

        # Pattern 2: Direct property access without await
        # e.g., params.slug (should be: (await params).slug)
        if grep -qE '(params|searchParams)\.[a-zA-Z]' "$FILE_PATH" 2>/dev/null; then
            if ! grep -qE 'await\s+(params|searchParams)|\(await\s+(params|searchParams)\)' "$FILE_PATH" 2>/dev/null; then
                echo "⚠️  WARNING: Next.js 15 requires 'await' for params/searchParams access"
                echo "   File: $FILE_PATH"
                echo "   Fix: Change 'params.slug' to '(await params).slug'"
                echo ""
            fi
        fi
    fi
fi

# Always output valid JSON for the hook system
echo '{}'
