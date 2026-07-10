```markdown
# alissonerp_v2 Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill covers the development patterns and conventions used in the `alissonerp_v2` repository, a TypeScript project built with the Next.js framework. It documents code style, commit message patterns, file organization, and testing practices, providing clear examples and commands to streamline common workflows.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `orderList.test.ts`

### Import Style
- Use **alias-based imports** rather than relative paths.
  - Example:
    ```typescript
    import { getUser } from '@/services/userService';
    ```

### Export Style
- **Mixed** export style: both named and default exports are used.
  - Named export example:
    ```typescript
    export function calculateTotal() { ... }
    ```
  - Default export example:
    ```typescript
    export default UserProfile;
    ```

### Commit Messages
- Follow the **Conventional Commits** standard.
- Common prefixes: `feat`, `fix`
- Example:
  ```
  feat: add user authentication middleware
  fix: correct order total calculation in checkout
  ```

## Workflows

### Creating a Feature
**Trigger:** When adding a new feature or module  
**Command:** `/create-feature`

1. Create a new file using camelCase in the appropriate directory.
2. Use alias imports for dependencies.
3. Export your component/function as needed (named or default).
4. Write a commit message starting with `feat:` and a concise description.

### Fixing a Bug
**Trigger:** When resolving a bug or issue  
**Command:** `/fix-bug`

1. Locate the relevant file(s) using camelCase naming.
2. Apply the bug fix, maintaining code style and import conventions.
3. Write a commit message starting with `fix:` and a concise description.

### Writing Tests
**Trigger:** When adding or updating tests  
**Command:** `/write-test`

1. Create a test file named with `.test.` before the extension (e.g., `userService.test.ts`).
2. Place the test file alongside the module or in a designated test directory.
3. Follow the project's code style for imports and exports.

## Testing Patterns

- Test files follow the pattern: `*.test.*` (e.g., `orderList.test.ts`).
- The testing framework is **unknown**, but standard TypeScript test practices apply.
- Example test file:
  ```typescript
  import { calculateTotal } from '@/utils/orderUtils';

  test('calculates total correctly', () => {
    expect(calculateTotal([10, 20])).toBe(30);
  });
  ```

## Commands

| Command          | Purpose                                  |
|------------------|------------------------------------------|
| /create-feature  | Start a new feature/module               |
| /fix-bug         | Apply a bug fix                          |
| /write-test      | Add or update a test file                |
```
