type SiteConfig = {
  title: string;
  description: string;
  author: string;
  siteUrl: string;
  logo?: string;
  ogImage: string;
  locale: string;
  twitter: {
    site: string;
  };
};

type Link = {
  text: string;
  href: string;
};

type Action = {
  href: string;
  text: string;
  icon?: string;
};

type FooterLinkGroup = {
  title: string;
  links: Link[];
};

type SocialLink = {
  ariaLabel: string;
  icon: string;
  href: string;
};

type NavigationConfig = {
  header: {
    links: Link[];
    actions: Action[];
  };
  footer: {
    links: FooterLinkGroup[];
    secondaryLinks: Link[];
    socialLinks: SocialLink[];
    footNote: string;
  };
};

export const SITE: SiteConfig = {
  title: 'Heaven Club - El mejor club de kitesurf de la costa del sol',
  description:
    'Heaven Club es el mejor club de kitesurf de la costa del sol. Conoce nuestros programas, nuestros cursos y nuestros eventos.',
  author: 'Heaven Club',
  siteUrl: 'https://heavenclub.es',
  ogImage: '/src/assets/images/og-image.webp', // Needs to be an absolute path /src/...
  locale: 'es_ES',
  twitter: {
    site: '@heavenclub',
  },
};

export const NAVIGATION: NavigationConfig = {
  header: {
    links: [],
    actions: [
      {
        href: '/signin/',
        text: 'Portal de socios',
        // icon: 'tabler:rocket',
      },
    ],
  },

  footer: {
    links: [
      {
        title: 'Heaven Club',
        links: [{ text: 'Sobre nosotros', href: '/#about' }],
      },
    ],
    secondaryLinks: [
      { text: 'Términos y condiciones', href: '/terms/' },
      { text: 'Política de privacidad', href: '/privacy/' },
    ],
    socialLinks: [
      {
        ariaLabel: 'Instagram',
        icon: 'tabler:brand-instagram',
        href: 'https://instagram.com/heaven_kite_club',
      },
      { ariaLabel: 'RSS', icon: 'tabler:rss', href: '/rss.xml' },
    ],
    footNote: `
          <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400"
          >© 2025 <a href="https://heavenclub.es/" class="hover:underline"
            >Heaven Club</a
          >. | Made with ❤️ by <a href="https://daniel.es" class="hover:underline">Daniel</a>
        </span>
          `,
  },
};
