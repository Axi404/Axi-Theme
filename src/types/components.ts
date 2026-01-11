import type { HTMLTag } from 'astro/types'

export interface BaseCardProps {
  as?: HTMLTag
  class?: string
  href?: string
  heading: string
  subheading?: string
}

export interface CardProps extends BaseCardProps {
  date?: string
}

export interface ProjectCardProps extends BaseCardProps {
  imagePath: string
  altText?: string
}