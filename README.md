# Anoma Pay Interface

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Build Tool**: Vite 7.x
- **Framework**: React 19.x
- **Language**: TypeScript 5.x
- **Compiler**: SWC (Fast Refresh)
- **Styling**: Tailwind CSS 4.x
- **Component Development**: Storybook 10.x
- **State Management**: Jotai
- **Data Fetching**: TanStack React Query
- **Routing**: React Router 7.x (declarative)

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Storybook

Run Storybook for component development:

```bash
npm run storybook
```

Storybook will be available at `http://localhost:6006/`

## 🏗️ Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Build Storybook:

```bash
npm run build-storybook
```

## 🧪 Linting

Run ESLint:

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AccountSelector.tsx
│   ├── Balance.tsx
│   ├── Button.tsx
│   ├── Checkbox.tsx
│   ├── CircleButton.tsx
│   ├── Token.tsx
│   ├── TokenBadge.tsx
│   ├── TokenSelector.tsx
│   ├── WalletSelector.tsx
│   ├── index.ts        # Component exports
│   └── stories/        # Storybook stories for components
├── config/             # Configuration files
│   ├── atoms.ts        # Jotai atoms
│   ├── queryClient.ts  # React Query client
│   └── router.tsx      # React Router configuration
├── App.tsx
├── main.tsx
└── index.css           # Tailwind imports
```

## 🎨 Components

All components are located in `src/components/` and follow a minimal base template:

```typescript
export const ComponentName = () => {
  /** base */
  return null;
};
```

Each component has a corresponding Storybook story in `src/components/stories/`.

## 📚 Libraries Usage

### React Query

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### React Router

```typescript
import { RouterProvider } from 'react-router';
import { router } from './config/router';

<RouterProvider router={router} />
```

### Jotai

```typescript
import { useAtom } from 'jotai';
import { exampleAtom } from './config/atoms';

function MyComponent() {
  const [value, setValue] = useAtom(exampleAtom);
  return <div>{value}</div>;
}
```

## 🔧 Configuration

- **Vite**: `vite.config.ts`
- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Tailwind CSS**: `tailwind.config.js`, `postcss.config.js`
- **ESLint**: `eslint.config.js`
- **Storybook**: `.storybook/main.ts`, `.storybook/preview.ts`

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
