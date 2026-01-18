# Work Safe CMS - Cursor Rules

This directory contains Cursor AI rules for the Work Safe CMS project. These rules help Cursor understand our codebase conventions and generate consistent, high-quality code.

## Directory Structure

```
.cursor/
└── rules/
    ├── core.mdc           # Always applies - core conventions
    ├── nextjs.mdc         # Next.js App Router patterns
    ├── react-components.mdc # React component conventions
    ├── tailwind.mdc       # Tailwind CSS styling
    ├── prisma.mdc         # Database and Prisma ORM
    ├── api-routes.mdc     # API route patterns
    ├── blocks.mdc         # CMS block system
    ├── testing.mdc        # Testing conventions
    └── admin.mdc          # Admin panel patterns
```

## Rule Types

| File | Type | When Applied |
|------|------|--------------|
| `core.mdc` | Always | Every conversation |
| `nextjs.mdc` | Auto-attach | When editing `src/app/**/*` |
| `react-components.mdc` | Auto-attach | When editing `src/components/**/*` |
| `tailwind.mdc` | Auto-attach | When editing `*.tsx` files |
| `prisma.mdc` | Auto-attach | When editing `prisma/**/*` |
| `api-routes.mdc` | Auto-attach | When editing `src/app/api/**/*` |
| `blocks.mdc` | Auto-attach | When editing block components |
| `testing.mdc` | Auto-attach | When editing test files |
| `admin.mdc` | Auto-attach | When editing admin components |

## How Rules Work

### Always Apply Rules
The `core.mdc` rule has `alwaysApply: true`, meaning it's included in every Cursor conversation. This contains fundamental conventions like:
- TypeScript usage
- Naming conventions
- Code style
- Git commit format

### Auto-Attach Rules
Other rules use `globs` patterns to auto-attach when you're working on matching files. For example, `nextjs.mdc` activates when you edit files in `src/app/`.

### Manual Rules
You can manually include any rule by typing `@rule-name` in Cursor's chat (Cmd+K).

## Key Conventions

### TypeScript
- Use TypeScript for ALL code
- Prefer interfaces over types
- No `any` types
- Explicit return types

### Components
- Functional components only
- Named exports preferred
- Props interfaces: `ComponentNameProps`
- Use shadcn/ui components

### Styling
- Tailwind CSS only
- Use CSS variables from design system
- Mobile-first responsive design
- Use `cn()` utility for conditional classes

### Data
- Prisma for database
- Server Components for data fetching
- Zod for validation
- ISR with 1-hour revalidation

## Adding New Rules

1. Create a new `.mdc` file in `.cursor/rules/`
2. Add YAML frontmatter:
   ```yaml
   ---
   description: Short description of the rule
   globs: path/pattern/**/*
   alwaysApply: false
   ---
   ```
3. Write the rule content in Markdown

## Best Practices

1. **Keep rules focused** - One domain per rule file
2. **Use examples** - Show code examples for patterns
3. **Be specific** - Concrete instructions work better than vague guidelines
4. **Update regularly** - Rules should evolve with the project
5. **Test rules** - Verify Cursor follows them correctly

## Resources

- [Cursor Rules Documentation](https://cursor.com/docs/context/rules)
- [Work Safe CMS Brief](/worksafe-cms-brief-v2.md)
- [E-commerce Spec](/worksafe-cms-ecommerce-spec.md)
