# Project Structure

This project follows modern full-stack web application best practices with clear separation of concerns and organized file structure.

## 📁 Directory Structure

```
origin-takehome-interview/
├── 📁 app/                          # Next.js App Router (root level)
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 patients/             # Patient-related endpoints
│   │   ├── 📁 sessions/             # Session-related endpoints
│   │   └── 📁 therapists/           # Therapist-related endpoints
│   ├── layout.tsx                   # Root layout component
│   └── page.tsx                     # Homepage (re-exports from src)
│
├── 📁 src/                          # Source code (main application logic)
│   ├── 📁 app/                      # App components and pages
│   │   └── page.tsx                 # Main dashboard component
│   ├── 📁 components/               # Reusable React components
│   │   ├── CreateSessionModal.tsx   # Session creation modal
│   │   ├── ErrorBoundary.tsx        # Error handling component
│   │   ├── Icons.tsx                # SVG icon components
│   │   └── SessionTable.tsx         # Session display table
│   ├── 📁 lib/                      # Utility libraries
│   │   ├── db.ts                    # Database connection
│   │   ├── schema.ts                # Database schema definitions
│   │   └── utils.ts                 # Utility functions
│   ├── 📁 types/                    # TypeScript type definitions
│   │   └── index.ts                 # Shared type definitions
│   ├── 📁 hooks/                    # Custom React hooks (future)
│   ├── 📁 utils/                    # Pure utility functions (future)
│   └── 📁 constants/                # Application constants (future)
│
├── 📁 src/styles/                   # Organized stylesheets
│   ├── 📁 components/               # Component-specific styles
│   │   ├── CreateSessionModal.module.css
│   │   ├── Dashboard.module.css
│   │   └── SessionTable.module.css
│   ├── 📁 pages/                    # Page-specific styles (future)
│   └── 📁 globals/                  # Global stylesheets
│       ├── globals.css              # Global styles and Tailwind
│       └── shared.css               # Shared utility classes
│
├── 📁 test/                         # Test files
│   ├── 📁 app/                      # App component tests
│   ├── 📁 components/               # Component tests
│   ├── 📁 api/                      # API route tests
│   ├── 📁 utils/                    # Test utilities
│   ├── jest.config.js               # Jest configuration
│   └── jest.setup.js                # Jest setup file
│
├── 📁 config/                       # Configuration files
│   ├── jest.config.js               # Jest configuration
│   ├── next.config.js               # Next.js configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── tailwind.config.js           # Tailwind CSS configuration
│
├── 📁 database/                     # Database related files
│   └── db_schema_reference.sql      # Database schema
│
├── 📁 docs/                         # Documentation
│   ├── README.md                    # Project documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── OPTIMIZATION_SUMMARY.md      # Performance optimizations
│   └── LICENSE                      # Project license
│
├── 📁 scripts/                      # Build and development scripts (future)
│
└── 📄 Configuration Files (Root)
    ├── package.json                 # Dependencies and scripts
    ├── tsconfig.json               # TypeScript configuration
    ├── .env.local                  # Environment variables
    ├── .gitignore                  # Git ignore patterns
    ├── next.config.js              # Next.js config (2-line import from config/)
    ├── tailwind.config.js          # Tailwind config (2-line import from config/)
    └── postcss.config.js           # PostCSS config (2-line import from config/)
```

**Note:** The `.js` files in the root are minimal (2 lines each) that reference the actual configurations in `config/`. These are required because Next.js, Tailwind CSS, and PostCSS have hardcoded expectations to find these files in the project root. Jest uses `--config=config/jest.config.js` to avoid needing a root-level file.

````

## 🎯 Architecture Principles

### 1. **Separation of Concerns**

- **Frontend**: `src/` contains all application logic
- **Backend**: `app/api/` contains all API routes
- **Styles**: `src/styles/` organized by component/page/global
- **Tests**: `test/` mirrors source structure
- **Config**: `config/` centralizes all configuration

### 2. **Scalability**

- **Modular Components**: Each component has its own file
- **Type Safety**: Centralized types in `src/types/`
- **Utility Functions**: Shared utilities in `src/lib/`
- **Future-Ready**: Prepared directories for hooks, utils, constants

### 3. **Developer Experience**

- **Clear Paths**: TypeScript path mapping with `@/` prefix
- **Organized Styles**: Component-specific CSS modules
- **Comprehensive Testing**: Structured test organization
- **Documentation**: Centralized in `docs/` directory

## 🔧 Import Patterns

### TypeScript Path Mapping

All imports use the `@/` prefix which maps to `./src/`:

```typescript
import { SessionWithDetails } from "@/types";
import SessionTable from "@/components/SessionTable";
import { apiCall } from "@/lib/utils";
import styles from "@/styles/components/Dashboard.module.css";
````

### Component Structure

```typescript
// Component imports
import { useState, useCallback } from "react";
import { ComponentType } from "@/types";
import { utilityFunction } from "@/lib/utils";
import { SharedIcon } from "@/components/Icons";
import styles from "@/styles/components/ComponentName.module.css";
```

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `SessionTable.tsx`)
- **Pages**: PascalCase (e.g., `page.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Types**: camelCase (e.g., `index.ts`)
- **Styles**: kebab-case.module.css (e.g., `session-table.module.css`)
- **Tests**: ComponentName.test.tsx (e.g., `SessionTable.test.tsx`)

## 🚀 Benefits

1. **Maintainability**: Clear structure makes code easy to find and modify
2. **Scalability**: Prepared for team growth and feature expansion
3. **Performance**: Optimized imports and bundle splitting
4. **Testing**: Comprehensive test coverage with organized structure
5. **Developer Experience**: Clear patterns and conventions
6. **Deployment**: Separated concerns for easier CI/CD

## 🔄 Migration Notes

This structure was migrated from a flat directory structure to improve:

- Code organization and maintainability
- Team collaboration efficiency
- Build performance and bundle optimization
- Testing strategy and coverage
- Documentation and project understanding

All configuration files maintain backward compatibility through proxy files in the root directory.
