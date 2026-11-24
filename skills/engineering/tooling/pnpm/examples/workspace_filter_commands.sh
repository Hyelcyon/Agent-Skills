pnpm --filter @scope/web-app run build
pnpm --filter "...@scope/api" run test
pnpm --filter "./packages/*" run lint
pnpm --filter "...^@scope/core" run build
pnpm -r --parallel run typecheck
