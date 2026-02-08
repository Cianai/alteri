#!/bin/bash
# Context7 Reminder Hook
# Reminds to use Context7 for key library documentation lookups

# Key libraries that should trigger Context7 reminder
LIBRARIES=(
  "next"
  "nextjs"
  "react"
  "supabase"
  "prisma"
  "tailwind"
  "shadcn"
  "radix"
  "tanstack"
  "zod"
  "trpc"
  "vercel"
  "turborepo"
  "pnpm"
  "renv"
  "bootnet"
  "ggplot"
  "tidyverse"
)

# Check if the prompt mentions any key library
PROMPT="${TOOL_INPUT:-}"
PROMPT_LOWER=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

for lib in "${LIBRARIES[@]}"; do
  if [[ "$PROMPT_LOWER" == *"$lib"* ]]; then
    # Only remind, don't block
    echo "💡 REMINDER: Consider using Context7 for $lib documentation: /context7-plugin:docs $lib" >&2
    break
  fi
done

exit 0
