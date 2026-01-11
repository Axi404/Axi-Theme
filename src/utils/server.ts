import { getCollection, type CollectionEntry } from 'astro:content'

export type BlogPostEntry = CollectionEntry<'blog'> | CollectionEntry<'blogEn'>

export const prod = import.meta.env.PROD

/** Note: this function filters out draft posts based on the environment */
export async function getBlogCollection() {
  return await getCollection('blog', ({ data }) => {
    // Not in production & draft is not false
    return prod ? !data.draft : true
  })
}

/** 
 * Get English blog collection with fallback to Chinese version
 * If an English version (index-en.md) doesn't exist, use the Chinese version (index.md)
 */
export async function getBlogCollectionEn() {
  // Get all English versions
  const englishPosts = await getCollection('blogEn', ({ data }) => {
    return prod ? !data.draft : true
  })
  
  // Transform English post IDs from "anygrasp/index-en" to "anygrasp"
  const transformedEnglishPosts = englishPosts.map(post => ({
    ...post,
    id: post.id.replace(/\/index-en$/, '')
  }))
  
  // Get all Chinese versions
  const chinesePosts = await getBlogCollection()
  
  // Create a map of English posts by their slug (folder name)
  const englishPostSlugs = new Set(
    transformedEnglishPosts.map(post => {
      // Extract folder name from id: "anygrasp/index.md" -> "anygrasp"
      const match = post.id.match(/^(.+?)\/index\.(md|mdx)$/)
      return match ? match[1] : post.id
    })
  )
  
  // Add Chinese posts that don't have English versions
  const fallbackPosts = (chinesePosts as any[])
    .filter(post => {
      // Extract folder name from id: "anygrasp/index.md" -> "anygrasp"
      const match = post.id.match(/^(.+?)\/index\.(md|mdx)$/)
      const slug = match ? match[1] : post.id
      return !englishPostSlugs.has(slug)
    })
    .map(post => post as CollectionEntry<'blogEn'>)
  
  // Combine English posts and fallback Chinese posts
  return [...transformedEnglishPosts, ...fallbackPosts] as CollectionEntry<'blogEn'>[]
}

export async function getPostCollections() {
  return await getCollection('postCollections')
}

export async function getPostsForCollection(collection: CollectionEntry<'postCollections'>, isEn: boolean = false) {
  const allPosts = isEn ? await getBlogCollectionEn() : await getBlogCollection()
  const blogList = collection.data.bloglist || []
  
  // Create a mapping of possible IDs (lowercased) to posts for quick lookup
  const postMap = new Map<string, BlogPostEntry>()
  allPosts.forEach(post => {
    // Standard ID
    postMap.set(post.id.toLowerCase(), post)
    
    // Normalized ID (without extension/index)
    const match = post.id.match(/^(.+?)\/index\.(md|mdx)$/)
    if (match) {
      postMap.set(match[1].toLowerCase(), post)
    } else {
      // Also try to remove extension if it's not index
      postMap.set(post.id.replace(/\.(md|mdx)$/, '').toLowerCase(), post)
    }
  })

  // Map the blogList to actual post entries, preserving blogList order
  return blogList
    .map(itemId => postMap.get(itemId.toLowerCase()))
    .filter((post): post is BlogPostEntry => post !== undefined)
}

function getYearFromCollection(
  collection: BlogPostEntry
): number | undefined {
  const dateStr = collection.data.updatedDate ?? collection.data.publishDate
  return dateStr ? new Date(dateStr).getFullYear() : undefined
}

export function groupCollectionsByYear<T extends BlogPostEntry>(
  collections: T[]
): [number, T[]][] {
  const collectionsByYear = collections.reduce((acc, collection) => {
    const year = getYearFromCollection(collection)
    if (year !== undefined) {
      if (!acc.has(year)) {
        acc.set(year, [])
      }
      acc.get(year)!.push(collection)
    }
    return acc
  }, new Map<number, T[]>())

  return Array.from(
    collectionsByYear.entries()
  ).sort((a, b) => b[0] - a[0])
}


export function sortMDByDate<T extends BlogPostEntry>(collections: T[]): T[] {
  return [...collections].sort((a, b) => {
    const aUpdatedDate = a.data.updatedDate ? new Date(a.data.updatedDate).valueOf() : 0
    const bUpdatedDate = b.data.updatedDate ? new Date(b.data.updatedDate).valueOf() : 0
    if (aUpdatedDate !== bUpdatedDate) {
      return bUpdatedDate - aUpdatedDate
    }
    const aPublishDate = a.data.publishDate ? new Date(a.data.publishDate).valueOf() : 0
    const bPublishDate = b.data.publishDate ? new Date(b.data.publishDate).valueOf() : 0
    return bPublishDate - aPublishDate
  })
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getAllTags(collections: BlogPostEntry[]) {
  return collections.flatMap((collection) => [...collection.data.tags])
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTags(collections: BlogPostEntry[]) {
  return [...new Set(getAllTags(collections))]
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTagsWithCount(collections: BlogPostEntry[]): [string, number][] {
  return [
    ...getAllTags(collections).reduce(
      (acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
      new Map<string, number>()
    )
  ].sort((a, b) => b[1] - a[1])
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getAllCategories(collections: BlogPostEntry[]) {
  return collections
    .map((collection) => collection.data.category)
    .filter((category): category is string => category !== undefined)
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueCategories(collections: BlogPostEntry[]) {
  return [...new Set(getAllCategories(collections))]
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueCategoriesWithCount(collections: BlogPostEntry[]): [string, number][] {
  return [
    ...getAllCategories(collections).reduce(
      (acc, c) => acc.set(c, (acc.get(c) || 0) + 1),
      new Map<string, number>()
    )
  ].sort((a, b) => b[1] - a[1])
}

/** Filter collections by category */
export function getCollectionsByCategory<T extends BlogPostEntry>(collections: T[], category: string): T[] {
  return collections.filter((collection) => collection.data.category === category)
}
