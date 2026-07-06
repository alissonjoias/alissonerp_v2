```markdown
# alissonerp_v2 Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `alissonerp_v2` TypeScript codebase, built with Next.js. It covers file naming, import/export styles, commit message conventions, and testing patterns. By following these guidelines, contributors can write consistent, maintainable code and collaborate effectively.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `orderService.ts`

### Import Style
- Use **alias-based imports** rather than relative paths.
  - Example:
    ```typescript
    import { getUser } from '@services/userService';
    ```

### Export Style
- Mixed: Both named and default exports are used.
  - Named export example:
    ```typescript
    export function calculateTotal() { ... }
    ```
  - Default export example:
    ```typescript
    export default UserProfile;
    ```

### Commit Messages
- Use **Conventional Commits** with the `feat` prefix for features.
- Keep commit messages concise (average ~69 characters).
  - Example:
    ```
    feat: add user authentication middleware
    ```

## Workflows

_No explicit workflows were detected in this repository._

## Testing Patterns

- **Test File Pattern:** Test files are named with the `*.test.*` pattern.
  - Example: `userService.test.ts`
- **Testing Framework:** Not explicitly detected. Check project dependencies or documentation for specifics.
- **Test Example:**
  ```typescript
  // userService.test.ts
  import { getUser } from '@services/userService';

  describe('getUser', () => {
    it('should return user data', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command | Purpose |
|---------|---------|
| /commit | Format a commit message using the conventional pattern |
| /test   | Run all test files matching *.test.* |
| /import | Suggest alias-based import for a given module |
```
