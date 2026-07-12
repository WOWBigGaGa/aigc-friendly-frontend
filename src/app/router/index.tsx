// src/app/router/index.tsx

import {
  createBrowserRouter,
  isRouteErrorResponse,
  redirect,
  RouterProvider,
  useRouteError,
} from 'react-router';
import { lazy, Suspense } from 'react';

import { AppLayout, ArticleLayout, BlogLayout } from '@/app/layout';

const BlogAboutPage = lazy(() => import('@/pages/blog/about').then((mod) => ({ default: mod.BlogAboutPage })));
const BlogArchivePage = lazy(() => import('@/pages/blog/archive/[year]/[month]').then((mod) => ({ default: mod.BlogArchivePage })));
const BlogArticlePage = lazy(() => import('@/pages/blog/article/[id]').then((mod) => ({ default: mod.BlogArticlePage })));
const BlogCategoryPage = lazy(() => import('@/pages/blog/category/[slug]').then((mod) => ({ default: mod.BlogCategoryPage })));
const BlogHomePage = lazy(() => import('@/pages/blog/home').then((mod) => ({ default: mod.BlogHomePage })));
const BlogLinksPage = lazy(() => import('@/pages/blog/links').then((mod) => ({ default: mod.BlogLinksPage })));
const BlogSearchPage = lazy(() => import('@/pages/blog/search').then((mod) => ({ default: mod.BlogSearchPage })));
const BlogTagPage = lazy(() => import('@/pages/blog/tag/[slug]').then((mod) => ({ default: mod.BlogTagPage })));

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
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--ant-color-border)',
          borderTopColor: 'var(--ant-color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
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
]);

export function App() {
  return <RouterProvider router={router} />;
}
