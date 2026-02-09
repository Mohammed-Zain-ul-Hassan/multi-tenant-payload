import type { MigrateUpArgs } from '@payloadcms/db-mongodb'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const superAdmin = await payload.create({
    collection: 'users',
    data: {
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['super-admin'],
      collection: 'users',
    },
    draft: false,
    req,
  })

  const tenant1 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 1',
      slug: 'tenant-1',
      brandVoice: 'Professional, technical, and authoritative. Focus on developer experience and scalability.',
      keywords: [
        { keyword: 'PayloadCMS' },
        { keyword: 'Multi-tenant' },
        { keyword: 'TypeScript' },
        { keyword: 'Next.js' }
      ],
      customData: [
        { key: 'support_email', value: 'support@tenant1.com' },
        { key: 'api_version', value: 'v2' }
      ]
    },
    draft: false,
    req,
  })

  const tenant2 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 2',
      slug: 'tenant-2',
      brandVoice: 'Playful, creative, and engaging. Focus on modern design trends and user experience.',
      keywords: [
        { keyword: 'Design' },
        { keyword: 'UX' },
        { keyword: 'Frontend' },
        { keyword: 'Innovation' }
      ],
      customData: [
        { key: 'theme_mode', value: 'dark' }
      ]
    },
    draft: false,
    req,
  })

  const tenant3 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 3',
      slug: 'tenant-3',
      brandVoice: 'Formal, informative, and academic. Focus on research, data integrity, and education.',
      keywords: [
        { keyword: 'Research' },
        { keyword: 'Data Analysis' },
        { keyword: 'Education' }
      ],
    },
    draft: false,
    req,
  })

  // Create some media items for the blogs
  const imagePath = path.resolve(dirname, '../../media/Avatar_Aang.png')

  const mediaData = fs.readFileSync(imagePath)
  const mediaSize = fs.statSync(imagePath).size

  const media1 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Avatar Tenant 1',
      tenant: String(tenant1.id),
    },
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    req,
  })

  const media2 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Avatar Tenant 2',
      tenant: String(tenant2.id),
    },
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    req,
  })

  const media3 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Avatar Tenant 3',
      tenant: String(tenant3.id),
    },
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant1@payloadcms.com',
      password: 'test',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: String(tenant1.id),
        },
      ],
      username: 'tenant1',
      collection: 'users',
    },
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant2@payloadcms.com',
      password: 'test',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: String(tenant2.id),
        },
      ],
      username: 'tenant2',
      collection: 'users',
    },
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant3@payloadcms.com',
      password: 'test',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: String(tenant3.id),
        },
      ],
      username: 'tenant3',
      collection: 'users',
    },
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'multi-admin@payloadcms.com',
      password: 'test',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: String(tenant1.id),
        },
        {
          roles: ['tenant-admin'],
          tenant: String(tenant2.id),
        },
        {
          roles: ['tenant-admin'],
          tenant: String(tenant3.id),
        },
      ],
      username: 'multi-admin',
      collection: 'users',
    },
    draft: false,
    req,
  })

  const content = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'text',
              text: 'Initial content...',
            },
          ],
        },
      ],
      direction: 'ltr' as const,
      format: 'left' as const,
      indent: 0,
      version: 1,
    },
  } as any

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-1',
      tenant: String(tenant1.id),
      title: 'Page for Tenant 1',
      user: String(superAdmin.id),
      featuredImage: String(media1.id),
      metaDescription: 'This is a page for Tenant 1',
      content,
    },
    draft: false,
    req,
  })

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-2',
      tenant: String(tenant2.id),
      title: 'Page for Tenant 2',
      user: String(superAdmin.id),
      featuredImage: String(media2.id),
      metaDescription: 'This is a page for Tenant 2',
      content,
    },
    draft: false,
    req,
  })

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-3',
      tenant: String(tenant3.id),
      title: 'Page for Tenant 3',
      user: String(superAdmin.id),
      featuredImage: String(media3.id),
      metaDescription: 'This is a page for Tenant 3',
      content,
    },
    draft: false,
    req,
  })
}

