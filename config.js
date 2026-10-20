/**
 * Central site configuration.
 * Change SITE_URL after the domain is connected — every SEO artefact
 * (canonical, OG tags, sitemap, hreflang, structured data) derives from here.
 */
module.exports = {
  SITE_URL: "https://scoutaitools.blogspot.com",
  SITE_NAME: "AI Tool Scout",
  TAGLINE: "Find the right AI tool in minutes, not weeks",
  LOGO_URL: "https://aitoolscout.com/logo.png",
  LANGUAGE: "en",
  LOCALE: "en_US",
  THEME_COLOR: "#070b14",
  AUTHOR: {
    name: "AI Tool Scout Editorial",
    url: "https://aitoolscout.com/about/",
  },
  CONTACT_EMAIL: "hello@aitoolscout.com",
  NAV: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog/" },
    { label: "Guides", href: "/guides/" },
    { label: "About", href: "/about/" },
    { label: "Contact", href: "/contact/" },
  ],
  FOOTER_LINKS: [
    { label: "Privacy Policy", href: "/privacy-policy/" },
    { label: "Terms of Service", href: "/terms/" },
    { label: "About", href: "/about/" },
    { label: "Contact", href: "/contact/" },
  ],
  // AdSense publisher id — replace with the real one before going live.
  ADSENSE_CLIENT: "ca-pub-0000000000000000",
  ADSENSE_ENABLED: false,
  GA_MEASUREMENT_ID: "",
};
