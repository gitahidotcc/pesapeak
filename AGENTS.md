# PesaPeak Development Guide

Welcome to the PesaPeak monorepo! This guide will help you understand the repository structure, tooling, and development workflow.

## 📁 Repository Structure

```
pesapeak/
├── apps/                          # Applications
│   └── landing/                   # Landing page (Vite + React + TypeScript)
├── packages/                      # Shared packages
│   └── ui/                        # Design system components
├── tooling/                       # Shared development tooling
│   ├── oxlint/                    # Linting configurations
│   ├── prettier/                  # Code formatting
│   ├── tailwind/                  # Tailwind CSS configs
│   └── typescript/                # TypeScript configurations
├── .oxlintrc.json                 # Root linting config
├── package.json                   # Root package management
└── pnpm-workspace.yaml           # Workspace configuration
```

## 🛠️ Technology Stack

### Core Technologies
- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config)
- **Linting**: Oxlint (fast ESLint alternative)
- **Formatting**: Prettier
- **Package Manager**: pnpm


## 🚀 Getting Started


### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build all packages
pnpm run build
```

## 📦 Package Management

### Adding Dependencies
```bash
# Add to specific package
pnpm add <package> --filter @pesapeak/landing
pnpm add -D <package> --filter @pesapeak/landing

# Add to workspace root
pnpm add -Dw <package>
```

### Workspace Scripts
```bash
# Development
pnpm run dev              # Start landing dev server
pnpm run build            # Build landing app
pnpm run preview          # Preview built app

# Code Quality
pnpm run lint             # Lint all packages
pnpm run format           # Format all files
pnpm run typecheck        # Type check landing app
```

## 🎨 Styling with Tailwind CSS v4

### Shared Configuration
All apps use the shared Tailwind configuration from `tooling/tailwind/`:

```css
/* In your CSS files */
@import "@pesapeak/tailwind-config/globals.css";
```

### Theme Variables
The shared config includes CSS variables for consistent theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

### Usage
```tsx
// Use theme variables in components
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Click me
  </button>
</div>
```

## 🔧 Development Tooling

### Linting (Oxlint)
All packages use shared linting configurations:

- **Base rules**: `@pesapeak/oxlint-config/base`
- **React rules**: `@pesapeak/oxlint-config/react`
- **Next.js rules**: `@pesapeak/oxlint-config/nextjs`

### TypeScript
Shared TypeScript configurations:

- **Base config**: `@pesapeak/tsconfig/base.json`
- **Node config**: `@pesapeak/tsconfig/node.json`

### Prettier
Consistent code formatting with `@pesapeak/prettier-config`:

- Import sorting
- Tailwind class sorting
- Consistent formatting rules

## 📱 Applications

### Landing App (`apps/landing/`)
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Port**: 5173 (configurable via `DEV_PORT`)

#### Development
```bash
# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview build
pnpm run preview
```

#### Configuration Files
- `vite.config.ts` - Vite configuration
- `postcss.config.js` - PostCSS with Tailwind
- `tsconfig.app.json` - TypeScript config (extends shared)
- `.oxlintrc.json` - Linting config (extends shared)

## 🧩 Shared Packages

### UI Package (`packages/ui/`)
Design system components:

```tsx
import { Button, Card, Code } from "@repo/ui";

// Usage
<Button appName="landing" className="bg-primary">
  Click me
</Button>
```

### Tooling Packages
- `@pesapeak/oxlint-config` - Linting rules
- `@pesapeak/prettier-config` - Formatting rules
- `@pesapeak/tsconfig` - TypeScript configs
- `@pesapeak/tailwind-config` - Tailwind CSS configs

## 🔄 Development Workflow

### 1. Start Development
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

### 2. Code Quality Checks
```bash
# Lint all packages
pnpm run lint

# Format all files
pnpm run format

# Type check
pnpm run typecheck
```

### 3. Building
```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @pesapeak/landing run build
```

## 🎯 Best Practices

### File Organization
- Keep components in `src/` directories
- Use shared tooling configs (don't duplicate)
- Follow the established naming conventions

### Code Quality
- All code is automatically linted with Oxlint
- Prettier handles code formatting
- TypeScript provides type safety

### Styling
- Use Tailwind CSS classes
- Leverage shared theme variables
- Follow the design system patterns

### Package Management
- Use workspace dependencies (`workspace:*`)
- Add packages to specific apps when needed
- Keep shared dependencies in tooling packages

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
pnpm clean
pnpm install
```

#### Linting Issues
```bash
# Fix linting issues
pnpm run lint:fix
```

#### TypeScript Errors
```bash
# Check types
pnpm run typecheck
```

### Performance Tips
- Use `pnpm --filter` for specific package operations
- Leverage Turborepo caching for faster builds
- Keep dependencies up to date

## 📚 Additional Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Oxlint Documentation](https://oxc-project.github.io/docs/linter/)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 🤝 Contributing

1. Follow the established code style
2. Use shared tooling configurations
3. Test your changes with `pnpm run build`
4. Ensure all linting passes with `pnpm run lint`

---

**Happy coding! 🚀**
