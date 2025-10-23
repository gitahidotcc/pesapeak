import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PesaPeak',
    short_name: 'PesaPeak',
    description: 'PesaPeak helps you understand your spending habits with smart categorization and insights. Track expenses manually, organize your accounts, and get a complete picture of your financial health—all in one place.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#222222',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    categories: ['finance', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icons/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/logo_white_bg.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/logo_dark_bg.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your financial dashboard',
        url: '/dashboard',
        icons: [
          {
            src: '/icons/logo-icon.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
          },
        ],
      },
      {
        name: 'Sign In',
        short_name: 'Sign In',
        description: 'Sign in to your account',
        url: '/auth/sign-in',
        icons: [
          {
            src: '/icons/logo-icon.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/icons/icon.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
        label: 'PesaPeak Dashboard',
      },
    ],
    prefer_related_applications: false,
  };
}