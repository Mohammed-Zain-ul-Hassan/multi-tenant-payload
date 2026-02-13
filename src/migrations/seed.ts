import type { MigrateUpArgs } from '@payloadcms/db-mongodb'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  console.log('--- STARTING SEED MIGRATION ---')

  // Create Super Admin
  const admin = await payload.create({
    collection: 'users',
    data: {
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['super-admin'],
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  // Create Tenants
  const tenant1 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 1',
      slug: 'tenant-1',
      brandVoice: 'Professional and authoritative.',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  const tenant2 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 2',
      slug: 'tenant-2',
      brandVoice: 'Creative and engaging.',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  const tenant3 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 3',
      slug: 'tenant-3',
      brandVoice: 'Informative and academic.',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  // Media
  const imagePath = path.resolve(dirname, '../../media/Avatar_Aang.png')
  const mediaData = fs.readFileSync(imagePath)
  const mediaSize = fs.statSync(imagePath).size

  const media1 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Media 1',
      tenant: tenant1.id,
    },
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  const media2 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Media 2',
      tenant: tenant2.id,
    },
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  const media3 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Media 3',
      tenant: tenant3.id,
    },
    file: {
      name: 'Avatar_Aang.png',
      mimetype: 'image/png',
      data: mediaData,
      size: mediaSize,
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  // Tenant Admins
  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant1@payloadcms.com',
      password: 'test',
      tenants: [{ roles: ['tenant-admin'], tenant: tenant1.id }],
      username: 'tenant1',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant2@payloadcms.com',
      password: 'test',
      tenants: [{ roles: ['tenant-admin'], tenant: tenant2.id }],
      username: 'tenant2',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant3@payloadcms.com',
      password: 'test',
      tenants: [{ roles: ['tenant-admin'], tenant: tenant3.id }],
      username: 'tenant3',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  // Multi Admin
  await payload.create({
    collection: 'users',
    data: {
      email: 'multi-admin@payloadcms.com',
      password: 'test',
      tenants: [
        { roles: ['tenant-admin'], tenant: tenant1.id },
        { roles: ['tenant-admin'], tenant: tenant2.id },
        { roles: ['tenant-admin'], tenant: tenant3.id },
      ],
      username: 'multi-admin',
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  // Content for blogs
  const content = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', text: 'Initial content...' }],
        },
      ],
      direction: 'ltr' as const,
      format: 'left' as const,
      indent: 0,
      version: 1,
    },
  }

  // Blogs
  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-1',
      tenant: tenant1.id,
      title: 'Page for Tenant 1',
      user: admin.id,
      featuredImage: media1.id,
      metaDescription: 'This is a page for Tenant 1',
      content,
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-2',
      tenant: tenant2.id,
      title: 'Page for Tenant 2',
      user: admin.id,
      featuredImage: media2.id,
      metaDescription: 'This is a page for Tenant 2',
      content,
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-3',
      tenant: tenant3.id,
      title: 'Page for Tenant 3',
      user: admin.id,
      featuredImage: media3.id,
      metaDescription: 'This is a page for Tenant 3',
      content,
    },
    overrideAccess: true,
    draft: false,
    req,
  })

  console.log('--- SEEDING COMPLETE ---')
}

export async function down({ payload }: MigrateUpArgs): Promise<void> {
  // Optional cleanup
}
