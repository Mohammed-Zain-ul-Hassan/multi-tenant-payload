import type { MigrateUpArgs } from '@payloadcms/db-mongodb'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  payload.logger.info('Starting seed migration...')

  const superAdmin = await payload.create({
    collection: 'users',
    data: {
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['super-admin'],
    } as any,
    overrideAccess: true,
    req,
  })

  payload.logger.info(`Created Super Admin: ${superAdmin.id}`)

  const tenant1 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 1',
      slug: 'tenant-1',
      brandVoice: 'Professional, technical, and authoritative. Focus on developer experience and scalability.',
      keywords: [
        { keyword: 'PayloadCMS' } as any,
        { keyword: 'Multi-tenant' } as any,
        { keyword: 'TypeScript' } as any,
        { keyword: 'Next.js' } as any
      ],
      customData: [
        { key: 'support_email', value: 'support@tenant1.com' } as any,
        { key: 'api_version', value: 'v2' } as any
      ]
    } as any,
    overrideAccess: true,
    req,
  })

  payload.logger.info(`Created Tenant 1: ${tenant1.id}`)

  const tenant2 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 2',
      slug: 'tenant-2',
      brandVoice: 'Playful, creative, and engaging. Focus on modern design trends and user experience.',
      keywords: [
        { keyword: 'Design' } as any,
        { keyword: 'UX' } as any,
        { keyword: 'Frontend' } as any,
        { keyword: 'Innovation' } as any
      ],
      customData: [
        { key: 'theme_mode', value: 'dark' } as any
      ]
    } as any,
    overrideAccess: true,
    req,
  })

  payload.logger.info(`Created Tenant 2: ${tenant2.id}`)

  const tenant3 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 3',
      slug: 'tenant-3',
      brandVoice: 'Formal, informative, and academic. Focus on research, data integrity, and education.',
      keywords: [
        { keyword: 'Research' } as any,
        { keyword: 'Data Analysis' } as any,
        { keyword: 'Education' } as any
      ],
    } as any,
    overrideAccess: true,
    req,
  })

  payload.logger.info(`Created Tenant 3: ${tenant3.id}`)

  // Create some media items for the blogs
  const imagePath = path.resolve(dirname, '../../media/Avatar_Aang.png')

  const mediaData = fs.readFileSync(imagePath)
  const mediaSize = fs.statSync(imagePath).size

  const media1 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Avatar Tenant 1',
      tenant: String(tenant1.id),
    } as any,
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    overrideAccess: true,
    req,
  })

  const media2 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Avatar Tenant 2',
      tenant: String(tenant2.id),
    } as any,
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    overrideAccess: true,
    req,
  })

  const media3 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Avatar Tenant 3',
      tenant: String(tenant3.id),
    } as any,
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    overrideAccess: true,
    req,
  })

  payload.logger.info('Media items created.')

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant1@payloadcms.com',
      password: 'test',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: String(tenant1.id),
        } as any,
      ],
      username: 'tenant1',
    } as any,
    overrideAccess: true,
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
        } as any,
      ],
      username: 'tenant2',
    } as any,
    overrideAccess: true,
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
        } as any,
      ],
      username: 'tenant3',
    } as any,
    overrideAccess: true,
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
        } as any,
        {
          roles: ['tenant-admin'],
          tenant: String(tenant2.id),
        } as any,
        {
          roles: ['tenant-admin'],
          tenant: String(tenant3.id),
        } as any,
      ],
      username: 'multi-admin',
    } as any,
    overrideAccess: true,
    req,
  })

  payload.logger.info('Users created.')

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
    } as any,
    overrideAccess: true,
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
    } as any,
    overrideAccess: true,
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
    } as any,
    overrideAccess: true,
    req,
  })

  payload.logger.info('Blogs created. Seeding complete.')
}

