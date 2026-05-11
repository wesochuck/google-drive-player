# Agent Guidelines

- **Interface Updates:** When modifying a TypeScript interface (e.g., adding new required properties), always ensure you update the mock data in corresponding `.test.tsx` and `.test.ts` files to prevent type errors.
- **Component Props:** When updating component props, ensure all corresponding test cases are updated to render the component with the newly required props.
- **Type Safety:** Always verify changes with `npm run type-check` before finalizing to catch compilation errors that might not appear in basic unit tests.
- **Environment-Specific Types:** When working in browser contexts (e.g., Vite/React), avoid using `NodeJS` namespace types (like `NodeJS.Timeout`). Instead, use environment-neutral types like `ReturnType<typeof setTimeout>` or `number` to ensure compatibility across build environments.
