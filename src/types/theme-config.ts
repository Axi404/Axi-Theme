import { z } from 'astro/zod'

import { FaviconSchema } from '../schemas/favicon'
import { HeadConfigSchema } from '../schemas/head'
import { HeaderMenuSchema } from '../schemas/header'
import { LocaleConfigSchema } from '../schemas/locale'
import { LogoConfigSchema } from '../schemas/logo'
import { ShareSchema } from '../schemas/share'
import { SocialLinksSchema } from '../schemas/social'

export const ThemeConfigSchema = () =>
  z.object({
    /** Title for your website. Will be used in metadata and as browser tab title. */
    title: z
      .string()
      .describe('Title for your website. Will be used in metadata and as browser tab title.'),

    /** Will be used in index page & copyright declaration */
    author: z.string().describe('Will be used in index page & copyright declaration'),

    /** English version of author name */
    author_en: z.string().optional().describe('English version of author name'),

    /** Description metadata for your website. Can be used in page metadata. */
    description: z
      .string()
      .default('Built with Astro-Axi')
      .describe('Description metadata for your website. Can be used in page metadata.'),

    /** English version of description */
    description_en: z.string().optional().describe('English version of description'),

    /** The default favicon for your site which should be a path to an image in the `public/` directory. */
    favicon: FaviconSchema(),

    /** Set a logo image to show in the homepage. */
    logo: LogoConfigSchema(),

    /** The tagline for your website. */
    tagline: z.string().optional().describe('The tagline for your website.'),

    /** Configure the defaults for the table of contents on each page. */
    //   tableOfContents: TableOfContentsSchema(),

    /**
     * Specify the default language for this site.
     *
     * The default locale will be used to provide fallback content where translations are missing.
     */
    locale: LocaleConfigSchema(),

    /**
     * Add extra tags to your site’s `<head>`.
     *
     * Can also be set for a single page in a page’s frontmatter.
     *
     * @example
     * // Add Fathom analytics to your site
     * starlight({
     *  head: [
     *    {
     *      tag: 'script',
     *      attrs: {
     *        src: 'https://cdn.usefathom.com/script.js',
     *        'data-site': 'MY-FATHOM-ID',
     *        defer: true,
     *      },
     *    },
     *  ],
     * })
     */
    head: HeadConfigSchema(),

    /**
     * Provide CSS files to customize the look and feel of your Starlight site.
     *
     * Supports local CSS files relative to the root of your project,
     * e.g. `'/src/custom.css'`, and CSS you installed as an npm
     * module, e.g. `'@fontsource/roboto'`.
     *
     * @example
     * starlight({
     *  customCss: ['/src/custom-styles.css', '@fontsource/roboto'],
     * })
     */
    customCss: z.string().array().optional().default([]),

    /** Will be used as title delimiter in the generated `<title>` tag. */
    titleDelimiter: z
      .string()
      .describe('Will be used as title delimiter in the generated `<title>` tag.')
      .default('•'),

    /**
     * Define whether Starlight pages should be prerendered or not.
     * Defaults to always prerender Starlight pages, even when the project is
     * set to "server" output mode.
     */
    prerender: z.boolean().default(true),

    /** The npm CDN to use for loading npm packages.
     * @example
     * npmCDN: 'https://cdn.jsdelivr.net/npm'
     * npmCDN: 'https://cdn.smartcis.cn/npm'
     * npmCDN: 'https://unkpg.com'
     * npmCDN: 'https://cdn.cbd.int'
     * npmCDN: 'https://esm.sh'
     */
    npmCDN: z
      .string()
      .default('https://esm.sh')
      .describe('The npm CDN to use for loading npm packages.'),

    /** Configure the header of your site. */
    header: z.object({
      /** The header menu items for your site.
       * @example
       * header: [
       *   { title: 'Home', link: '/' },
       *   { title: 'Blog', link: '/blog' }
       * ]
       */
      menu: HeaderMenuSchema()
    }),

    /** Configure the footer of your site. */
    footer: z.object({
      /** Registration information for ICP (optional) */
      registration: z.object({
        /** Regstration link */
        url: z.string().optional().describe('Regstration link'),
        /** Registration show text */
        text: z.string().optional().describe('Registration show text'),
        /** Registration website */
        website: z.string().optional().describe('Registration website')
      }),

      /** Enable displaying a “Astro & Axi theme powered” link in your site’s footer. */
      credits: z
        .boolean()
        .default(true)
        .describe('Enable displaying a “Built with Starlight” link in your site’s footer.'),

      /**
       * Optional details about the social media accounts for this site.
       *
       * @example
       * social: {
       *   discord: 'https://astro.build/chat',
       *   github: 'https://github.com/withastro/starlight',
       *   gitlab: 'https://gitlab.com/delucis',
       *   threads: 'https://www.threads.net/@nmoodev',
       *   twitch: 'https://www.twitch.tv/bholmesdev',
       *   twitter: 'https://twitter.com/astrodotbuild',
       *   youtube: 'https://youtube.com/@astrodotbuild',
       * }
       */
      social: SocialLinksSchema()
    }),

    content: z.object({
      externalLinksContent: z.string().optional().default(' ↗'),

      /** Blog page size for pagination */
      blogPageSize: z.number().optional().default(8),

      /** Show external link arrow */
      externalLinkArrow: z.boolean().optional().default(true),

      /** Share buttons to show */
      share: ShareSchema()
    }),

    /** Personal information configuration */
    personal: z.object({
      /** Your location */
      location: z.string().optional().describe('Your location'),

      /** Your GitHub username */
      githubUsername: z.string().optional().describe('Your GitHub username'),

      /** Your email address */
      email: z.string().optional().describe('Your email address'),

      /** Your Google Scholar profile URL */
      googleScholar: z.string().optional().describe('Your Google Scholar profile URL'),

      /** Blog start date for statistics */
      blogStartDate: z.string().optional().describe('Blog start date for statistics'),

      /** Domain configuration */
      domains: z.object({
        /** Main domain */
        main: z.string().describe('Main domain'),
        /** GitHub Pages domain */
        githubPages: z.string().optional().describe('GitHub Pages domain'),
        /** Cloudflare domain */
        cloudflare: z.string().optional().describe('Cloudflare domain'),
        /** Friend Circle domain */
        friendCircle: z.string().optional().describe('Friend Circle domain'),
      }).optional().describe('Domain configuration')
    }).optional().describe('Personal information configuration')
  })

export type ThemeUserConfig = z.input<ReturnType<typeof ThemeConfigSchema>>
export type ThemeConfig = z.infer<ReturnType<typeof ThemeConfigSchema>>
