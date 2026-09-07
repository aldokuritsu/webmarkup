import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Articles du blog — migrés depuis les posts WordPress (URL à la racine, comme avant). */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.string().optional(),
      categorySlug: z.string().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
    }),
});

/** Pages éditoriales simples rendues telles quelles (mentions, page héritée). */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date().optional(),
    noindex: z.boolean().optional(),
  }),
});

export const collections = { blog, pages };
