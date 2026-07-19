import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  isRouteErrorResponse,
  redirect,
  RouterProvider,
  useRouteError,
} from 'react-router';

import { AdminLayout, AppLayout, ArticleLayout, BlogLayout } from '@/app/layout';
import { ProtectedRoute } from '@/app/router/protected-route';

const BlogAboutPage = lazy(() =>
  import('@/pages/blog/about').then((mod) => ({ default: mod.BlogAboutPage })),
);
const BlogArchivePage = lazy(() =>
  import('@/pages/blog/archive/[year]/[month]').then((mod) => ({ default: mod.BlogArchivePage })),
);
const BlogArticlePage = lazy(() =>
  import('@/pages/blog/article/[id]').then((mod) => ({ default: mod.BlogArticlePage })),
);
const BlogCategoryPage = lazy(() =>
  import('@/pages/blog/category/[slug]').then((mod) => ({ default: mod.BlogCategoryPage })),
);
const BlogHomePage = lazy(() =>
  import('@/pages/blog/home').then((mod) => ({ default: mod.BlogHomePage })),
);
const BlogLinksPage = lazy(() =>
  import('@/pages/blog/links').then((mod) => ({ default: mod.BlogLinksPage })),
);
const BlogSearchPage = lazy(() =>
  import('@/pages/blog/search').then((mod) => ({ default: mod.BlogSearchPage })),
);
const BlogTagPage = lazy(() =>
  import('@/pages/blog/tag/[slug]').then((mod) => ({ default: mod.BlogTagPage })),
);

const AdminLoginPage = lazy(() =>
  import('@/pages/admin/login').then((mod) => ({ default: mod.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/dashboard').then((mod) => ({ default: mod.AdminDashboardPage })),
);
const AdminArticlesPage = lazy(() =>
  import('@/pages/admin/articles').then((mod) => ({ default: mod.AdminArticlesPage })),
);
const AdminArticleNewPage = lazy(() =>
  import('@/pages/admin/articles/new').then((mod) => ({ default: mod.AdminArticleNewPage })),
);
const AdminArticleEditPage = lazy(() =>
  import('@/pages/admin/articles/[id]/edit').then((mod) => ({ default: mod.AdminArticleEditPage })),
);
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/categories').then((mod) => ({ default: mod.AdminCategoriesPage })),
);
const AdminTagsPage = lazy(() =>
  import('@/pages/admin/tags').then((mod) => ({ default: mod.AdminTagsPage })),
);
const AdminCommentsPage = lazy(() =>
  import('@/pages/admin/comments').then((mod) => ({ default: mod.AdminCommentsPage })),
);
const AdminFilesPage = lazy(() =>
  import('@/pages/admin/files').then((mod) => ({ default: mod.AdminFilesPage })),
);
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/settings').then((mod) => ({ default: mod.AdminSettingsPage })),
);

import { ErrorPreviewPage } from '@/pages/error-preview';
import { HomePage } from '@/pages/home';
import { ProjectStructurePage } from '@/pages/project-structure';
import { Error403, Error404, Error500, ErrorRouteCrash } from '@/features/error-feedback';

import { getAppEnv } from '@/shared/env';

import { canAccessGame2048Lab, Game2048LabPage } from '@/labs/game-2048';
import { canAccessSandboxPlayground, SandboxPlaygroundPage } from '@/sandbox/playground';

function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      return <Error403 />;
    }

    if (error.status === 404) {
      return <Error404 />;
    }

    if (error.status >= 500) {
      return <Error500 />;
    }
  }

  return <ErrorRouteCrash />;
}

function RouteErrorBoundary() {
  return (
    <AppLayout>
      <RouteErrorPage />
    </AppLayout>
  );
}

function SuspenseFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
    </div>
  );
}

function game2048LabLoader() {
  if (!canAccessGame2048Lab(getAppEnv())) {
    throw redirect('/');
  }

  return null;
}

function sandboxPlaygroundLoader() {
  if (!canAccessSandboxPlayground(getAppEnv())) {
    throw redirect('/');
  }

  return null;
}

const router = createBrowserRouter([
  {
    children: [
      {
        element: <HomePage />,
        index: true,
      },
      {
        element: <ProjectStructurePage />,
        path: 'project-structure',
      },
      {
        element: <ErrorPreviewPage />,
        path: 'error-preview',
      },
      {
        element: <Game2048LabPage />,
        loader: game2048LabLoader,
        path: 'labs/game-2048',
      },
      {
        element: <SandboxPlaygroundPage />,
        loader: sandboxPlaygroundLoader,
        path: 'sandbox/playground',
      },
      {
        children: [
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogHomePage />
              </Suspense>
            ),
            index: true,
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogCategoryPage />
              </Suspense>
            ),
            path: 'category/:slug',
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogTagPage />
              </Suspense>
            ),
            path: 'tag/:slug',
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogArchivePage />
              </Suspense>
            ),
            path: 'archive/:year/:month',
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogAboutPage />
              </Suspense>
            ),
            path: 'about',
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogLinksPage />
              </Suspense>
            ),
            path: 'links',
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogSearchPage />
              </Suspense>
            ),
            path: 'search',
          },
        ],
        element: <BlogLayout />,
        path: 'blog',
      },
      {
        children: [
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogArticlePage />
              </Suspense>
            ),
            path: ':id',
          },
        ],
        element: <ArticleLayout />,
        path: 'blog/article',
      },
      {
        element: <Error404 />,
        path: '*',
      },
    ],
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    path: '/',
  },
  {
    children: [
      {
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <AdminLoginPage />
          </Suspense>
        ),
        path: 'login',
      },
      {
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'dashboard',
      },
      {
        children: [
          {
            element: (
              <ProtectedRoute>
                <Suspense fallback={<SuspenseFallback />}>
                  <AdminArticleNewPage />
                </Suspense>
              </ProtectedRoute>
            ),
            path: 'new',
          },
          {
            element: (
              <ProtectedRoute>
                <Suspense fallback={<SuspenseFallback />}>
                  <AdminArticleEditPage />
                </Suspense>
              </ProtectedRoute>
            ),
            path: ':id/edit',
          },
        ],
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminArticlesPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'articles',
      },
      {
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminCategoriesPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'categories',
      },
      {
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminTagsPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'tags',
      },
      {
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminCommentsPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'comments',
      },
      {
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminFilesPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'files',
      },
      {
        element: (
          <ProtectedRoute>
            <Suspense fallback={<SuspenseFallback />}>
              <AdminSettingsPage />
            </Suspense>
          </ProtectedRoute>
        ),
        path: 'settings',
      },
    ],
    element: <AdminLayout />,
    path: 'admin',
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
