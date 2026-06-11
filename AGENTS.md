# AGENTS.md — DanceFlow Dashboard (`custom-dashboard`)

## Quick start

```bash
pnpm install
pnpm run dev      # → http://localhost:3000
pnpm run build    # → /build
pnpm test         # react-scripts test (Jest + @testing-library)
```

No separate lint, typecheck, prettier, or commit-hook scripts exist.

## Architecture

**Single app, pure JS** (no TypeScript, no monorepo). `pnpm-workspace.yaml` only exists to allow `core-js` builds.

| Layer | Location | Notes |
|---|---|---|
| Entry | `src/index.js` | React 18 root, wraps `AuthProvider` → `NotificationProvider` → `AppRouter` |
| Router | `src/routes/AppRouter.jsx` | React Router v6, all pages lazy-loaded, routes guarded by `hasPermission()` |
| Shared components | `src/components/Common/` | DataTable, BaseFormModal, SearchFilter, etc. |
| Layout | `src/components/layout/` | Header, Sidebar, Footer |
| API | `src/api/axiosInstance.js` | Axios with JWT interceptor (Bearer token from localStorage), 401 → session-expired modal |
| Auth | `src/context/AuthContext.jsx` | Manages user, academy, permissions, modules, theme; stores all in localStorage |
| Notifications | `src/context/NotificationContext.jsx` | Polls `/notifications` every 60s |
| i18n | `src/i18n.js` | i18next, locales in `src/locales/` (`es.json`, `en.json`), fallback `es` |
| Theme | `src/config/themeConfig.js` | Ant Design ConfigProvider dark/light, persisted to backend via `authService.updateSettings` |

## Features (under `src/features/`)

Each module follows: `pages/`, `components/`, `hooks/`, `services/` (some also `styles/`, `types/`).

attendances — auth — classes — dashboard — notifications — onboarding — plans — profile — registrations — settings — students — teachers

## Key patterns

- **API calls**: `useFetch()` hook → axios instance → `REACT_APP_BACKEND_URL`. No direct axios imports in features.
- **List pages**: `useCrud(endpoint, title)` hook returns pagination, search, sort, selection, bulk-delete state.
- **RBAC**: `hasPermission("module:action")` (router) / `usePermission(module, action)` (components). Permission map stored in localStorage.
- **Routes**: lazy-loaded with `React.lazy` + `<Suspense fallback={<LoadingScreen />}>`. Authenticated routes nested under `<DashboardLayout />`.
- **Forms**: `BaseFormModal` and `useFormModal` for CRUD modals.
- **Drawers**: `DrawerDetails` and `useDrawerDetail` for detail side panels.
- **Env**: `REACT_APP_BASE_URL`, `REACT_APP_BACKEND`, `REACT_APP_BACKEND_URL` (see `.env_example`).

/Users/mac/Proyectos/dashboard-react/src/features/settings/sections/CustomFields.jsx