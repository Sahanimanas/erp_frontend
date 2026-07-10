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

const LandingPage = lazy(() => import("../pages/LandingPage"));

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

function buildRoutes(items, parentSectionKey = null) {
  return items.flatMap((item) => {
    // The top-level item establishes the "section" used for privilege gating;
    // its children inherit it so every page maps back to one sidebar section.
    const sectionKey = parentSectionKey ?? item.key;
    if (item.children?.length) {
      const firstVisible = item.children.find((c) => !c.hidden);
      return (
        <Route key={item.key} path={item.path}>
          {firstVisible && <Route index element={<Navigate to={firstVisible.path} replace />} />}
          {buildRoutes(item.children, sectionKey)}
        </Route>
      );
    }
    if (item.lazy) {
      const Page = safeLazy(item.lazy);
      return (
        <Route key={item.key} path={item.path}
          element={
            <RoleRoute allowedRoles={item.roles} sectionKey={sectionKey}>
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
  const { token, user } = useSelector(state => state.auth);
  // Logged-out visitors get the public landing page; authenticated users are
  // sent to their home dashboard.
  if (!token) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    );
  }
  const home = user?.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/dashboard";
  return <Navigate to={home} replace />;
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
