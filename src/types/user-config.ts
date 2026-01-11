import { z } from 'astro/zod'

import { HeadConfigSchema } from '../schemas/head'
import { LocaleConfigSchema } from '../schemas/locale'
import { LogoConfigSchema } from '../schemas/logo'
import { IntegrationConfigSchema } from './integrations-config'

// 创建一个简化的配置 schema 来避免递归类型问题
export const UserConfigSchema = z.object({
  // 基础配置
  title: z.string(),
  author: z.string(),
  author_en: z.string().optional(),
  description: z.string().optional(),
  description_en: z.string().optional(),
  favicon: z.string().optional(),
  titleDelimiter: z.string().default('•'),
  prerender: z.boolean().default(true),
  npmCDN: z.string().default('https://esm.sh'),
  
  // 样式配置
  customCss: z.string().array().optional().default([]),
  head: HeadConfigSchema().optional(),
  
  // Logo 配置
  logo: LogoConfigSchema().optional(),
  
  // 语言配置
  locale: LocaleConfigSchema(),
  
  // 头部配置
  header: z.object({
    menu: z.array(z.object({
      title: z.string(),
      link: z.string()
    })).optional()
  }).optional(),
  
  // 脚部配置
  footer: z.object({
    registration: z.object({
      url: z.string().optional(),
      text: z.string().optional(),
      website: z.string().optional()
    }).optional(),
    credits: z.boolean().optional().default(true),
    social: z.record(z.string()).optional()
  }).optional(),
  
  // 内容配置
  content: z.object({
    externalLinksContent: z.string().optional().default(' ↗'),
    blogPageSize: z.number().optional().default(8),
    externalLinkArrow: z.boolean().optional().default(true),
    share: z.array(z.string()).optional()
  }).optional(),
  
  // 个人信息配置
  personal: z.object({
    location: z.string().optional(),
    githubUsername: z.string().optional(),
    email: z.string().optional(),
    googleScholar: z.string().optional(),
    blogStartDate: z.string().optional(),
    domains: z.object({
      main: z.string(),
      githubPages: z.string().optional(),
      cloudflare: z.string().optional(),
      friendCircle: z.string().optional()
    }).optional()
  }).optional(),
  
  // 集成配置
  integ: IntegrationConfigSchema()
})

export type UserConfig = z.infer<typeof UserConfigSchema>
export type UserInputConfig = z.input<typeof UserConfigSchema>
