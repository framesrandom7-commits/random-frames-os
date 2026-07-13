# Architecture Guidelines - Random Frames OS

## Folder Structure

- \`/app\`: Next.js 16 App Router pages and layouts.
  - \`/app/api\`: API routes.
  - \`/app/actions\`: Server Actions for data mutation.
- \`/components\`: UI and feature components.
  - \`/components/ui\`: shadcn UI generic components.
  - \`/components/[feature]\`: Feature-specific components.
- \`/lib\`: Shared utilities, types, and configurations.
  - \`/lib/api\`: API response formatters and error handlers.
  - \`/lib/utils\`: Formatting, constants, date, and currency helpers.
  - \`/lib/validations\`: Zod validation schemas.
- \`/prisma\`: Database schema and migrations.

## Database Conventions

- All entities must include \`id\` (cuid), \`createdAt\`, \`updatedAt\`.
- Soft delete pattern is supported via \`deletedAt\`.
- Audit logs supported via \`createdBy\`, \`updatedBy\`.

## API Conventions

- Use Server Actions for internal mutations.
- Use API Routes for external access or complex GET requests requiring pagination/filtering.
- All API responses must follow the \`ApiResponse<T>\` interface.
- Catch errors using \`handleError()\` in \`lib/api/error-handler.ts\`.
