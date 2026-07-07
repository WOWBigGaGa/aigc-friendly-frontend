// src/app/router/index.tsx

import {
  createBrowserRouter,
  isRouteErrorResponse,
  redirect,
  RouterProvider,
  useRouteError,
} from 'react-router';

import { AppLayout, ArticleLayout, BlogLayout } from '@/app/layout';

import {
  BlogAboutPage,
  BlogArchivePage,
  BlogArticlePage,
  BlogCategoryPage,
  BlogHomePage,
  BlogLinksPage,
  BlogTagPage,
} from '@/pages/blog';
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
            element: <BlogHomePage />,
            index: true,
          },
          {
            element: <BlogCategoryPage />,
            path: 'category/:slug',
          },
          {
            element: <BlogTagPage />,
            path: 'tag/:slug',
          },
          {
            element: <BlogArchivePage />,
            path: 'archive/:year/:month',
          },
          {
            element: <BlogAboutPage />,
            path: 'about',
          },
          {
            element: <BlogLinksPage />,
            path: 'links',
          },
        ],
        element: <BlogLayout />,
        path: 'blog',
      },
      {
        children: [
          {
            element: <BlogArticlePage />,
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
