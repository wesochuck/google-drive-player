# Agent Guidelines

- **Interface Updates:** When modifying a TypeScript interface (e.g., adding new required properties), always ensure you update the mock data in corresponding `.test.tsx` and `.test.ts` files to prevent type errors.
- **Component Props:** When updating component props, ensure all corresponding test cases are updated to render the component with the newly required props.
