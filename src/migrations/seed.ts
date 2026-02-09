import type { MigrateUpArgs } from '@payloadcms/db-mongodb'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Hardcoded IDs to ensure valid BSON ObjectIds
const ADMIN_ID = '65d63f27f0e3412345678901'
const TENANT_1_ID = '65d63f27f0e3412345678911'
const TENANT_2_ID = '65d63f27f0e3412345678912'
const TENANT_3_ID = '65d63f27f0e3412345678913'
const MEDIA_1_ID = '65d63f27f0e3412345679001'
const MEDIA_2_ID = '65d63f27f0e3412345679002'
const MEDIA_3_ID = '65d63f27f0e3412345679003'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  console.log('--- STARTING SEED MIGRATION ---')

  // Create Super Admin
  await payload.create({
    collection: 'users',
    data: {
      id: ADMIN_ID,
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['super-admin'],
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  // Create Tenants
  await payload.create({
    collection: 'tenants',
    data: {
      id: TENANT_1_ID,
      name: 'Tenant 1',
      slug: 'tenant-1',
      brandVoice: 'Professional and authoritative.',
      keywords: [{ keyword: 'PayloadCMS' } as any],
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'tenants',
    data: {
      id: TENANT_2_ID,
      name: 'Tenant 2',
      slug: 'tenant-2',
      brandVoice: 'Creative and engaging.',
      keywords: [{ keyword: 'Design' } as any],
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'tenants',
    data: {
      id: TENANT_3_ID,
      name: 'Tenant 3',
      slug: 'tenant-3',
      brandVoice: 'Informative and academic.',
      keywords: [{ keyword: 'Research' } as any],
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  // Media
  const imagePath = path.resolve(dirname, '../../media/Avatar_Aang.png')
  const mediaData = fs.readFileSync(imagePath)
  const mediaSize = fs.statSync(imagePath).size

  await payload.create({
    collection: 'media',
    data: {
      id: MEDIA_1_ID,
      alt: 'Media 1',
      tenant: TENANT_1_ID,
    } as any,
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

  await payload.create({
    collection: 'media',
    data: {
      id: MEDIA_2_ID,
      alt: 'Media 2',
      tenant: TENANT_2_ID,
    } as any,
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

  await payload.create({
    collection: 'media',
    data: {
      id: MEDIA_3_ID,
      alt: 'Media 3',
      tenant: TENANT_3_ID,
    } as any,
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
      tenants: [{ roles: ['tenant-admin'], tenant: TENANT_1_ID } as any],
      username: 'tenant1',
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant2@payloadcms.com',
      password: 'test',
      tenants: [{ roles: ['tenant-admin'], tenant: TENANT_2_ID } as any],
      username: 'tenant2',
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: 'tenant3@payloadcms.com',
      password: 'test',
      tenants: [{ roles: ['tenant-admin'], tenant: TENANT_3_ID } as any],
      username: 'tenant3',
    } as any,
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
        { roles: ['tenant-admin'], tenant: TENANT_1_ID } as any,
        { roles: ['tenant-admin'], tenant: TENANT_2_ID } as any,
        { roles: ['tenant-admin'], tenant: TENANT_3_ID } as any,
      ],
      username: 'multi-admin',
    } as any,
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
  } as any

  // Blogs
  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-1',
      tenant: TENANT_1_ID,
      title: 'Page for Tenant 1',
      user: ADMIN_ID,
      featuredImage: MEDIA_1_ID,
      metaDescription: 'This is a page for Tenant 1',
      content,
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-2',
      tenant: TENANT_2_ID,
      title: 'Page for Tenant 2',
      user: ADMIN_ID,
      featuredImage: MEDIA_2_ID,
      metaDescription: 'This is a page for Tenant 2',
      content,
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  await payload.create({
    collection: 'blogs',
    data: {
      slug: 'home-3',
      tenant: TENANT_3_ID,
      title: 'Page for Tenant 3',
      user: ADMIN_ID,
      featuredImage: MEDIA_3_ID,
      metaDescription: 'This is a page for Tenant 3',
      content,
    } as any,
    overrideAccess: true,
    draft: false,
    req,
  })

  console.log('--- SEEDING COMPLETE ---')
}

export async function down({ payload }: MigrateUpArgs): Promise<void> {
  // Optional cleanup
}
