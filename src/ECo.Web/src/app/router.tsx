import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import { Privacy } from '@/pages/Privacy'
import { AppShell } from './AppShell'

/**
 * The primitives showcase ships only in development and in CI end-to-end builds
 * (VITE_SHOWCASE=true). The condition is constant at build time, so production
 * bundles drop the route and its chunk entirely.
 */
export const showcaseEnabled = import.meta.env.DEV || import.meta.env.VITE_SHOWCASE === 'true'

const Showcase = showcaseEnabled ? lazy(() => import('@/dev/Showcase')) : null

const children: RouteObject[] = [
  { index: true, element: <Home /> },
  { path: 'privacy', element: <Privacy /> },
  ...(Showcase
    ? [
        {
          path: 'dev/primitives',
          element: (
            <Suspense fallback={null}>
              <Showcase />
            </Suspense>
          ),
        },
      ]
    : []),
  { path: '*', element: <NotFound /> },
]

export const routes: RouteObject[] = [{ element: <AppShell />, children }]

export function createRouter() {
  return createBrowserRouter(routes)
}
