/**
 * AppRoutes.jsx — builds the React Router DOM tree from routeConfig.js
 */
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import DashboardLayout from "../layouts/DashboardLayout";
import { AuthLayout }  from "../layouts/AuthLayout";
import ProtectedRoute  from "./ProtectedRoute";
import RoleRoute       from "./RoleRoute";
import PageLoader      from "../components/loaders/PageLoader";
import { routeConfig, authRoutes, newRoutes, moreRoutes, settingsRoutes } from "./routeConfig";

import NotFoundPage  from "../pages/auth/NotFoundPage";
import ForbiddenPage from "../pages/auth/ForbiddenPage";

const Missing = () => (
  <div className="flex items-center justify-center h-64 flex-col gap-3">
    <span className="text-4xl">🚧</span>
    <p className="text-slate-500 text-sm">This page is under construction.</p>
  </div>
);

function safeLazy(factory) {
  if (!factory) return Missing;
  return lazy(() => factory().catch(() => ({ default: Missing })));
}

function buildRoutes(items) {
  return items.flatMap((item) => {
    if (item.children?.length) {
      const firstVisible = item.children.find((c) => !c.hidden);
      return (
        <Route key={item.key} path={item.path}>
          {firstVisible && <Route index element={<Navigate to={firstVisible.path} replace />} />}
          {buildRoutes(item.children)}
        </Route>
      );
    }
    if (item.lazy) {
      const Page = safeLazy(item.lazy);
      return (
        <Route key={item.key} path={item.path}
          element={
            <RoleRoute allowedRoles={item.roles}>
              <Suspense fallback={<PageLoader />}><Page /></Suspense>
            </RoleRoute>
          }
        />
      );
    }
    return [];
  });
}

function RootRoute() {
  const { token } = useSelector(state => state.auth);
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        {authRoutes.map(({ path, lazy: lazyFn }) => {
          const Page = safeLazy(lazyFn);
          return (
            <Route key={path} path={path}
              element={<Suspense fallback={<PageLoader />}><Page /></Suspense>}
            />
          );
        })}
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        {buildRoutes(routeConfig)}

        {/* Additional new routes */}
        {[...newRoutes, ...(moreRoutes||[]), ...(settingsRoutes||[])].map(({ key, path, lazy: lazyFn }) => {
          const Page = safeLazy(lazyFn);
          return (
            <Route key={key} path={path}
              element={<Suspense fallback={<PageLoader />}><Page /></Suspense>}
            />
          );
        })}
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*"    element={<NotFoundPage />} />
    </Routes>
  );
}
