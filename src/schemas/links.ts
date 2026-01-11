import { z } from 'astro/zod'

export const FriendLinksSchema = () =>
  z
    .object({
      logbook: z.array(
        z.object({
          date: z.string(),
          content: z.string()
        })
      ),
      applyTip: z.array(
        z.object({
          name: z.string(),
          val: z.string()
        })
      )
    })
    .default({
      logbook: [],
      applyTip: [
        { name: 'Name', val: 'Your Site Name' },
        { name: 'Desc', val: 'Your Site Description' },
        { name: 'Link', val: 'https://example.com/' },
        { name: 'Avatar', val: 'https://example.com/avatar/avatar.webp' }
      ]
    })
    .describe('Friend links for your website.')
