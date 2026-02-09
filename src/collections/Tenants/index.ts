import type { CollectionConfig } from 'payload'

import { isSuperAdmin } from '../../access/isSuperAdmin'
import { canMutateTenant, filterByTenantRead } from './access/byTenant'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isSuperAdmin,
    delete: canMutateTenant,
    read: filterByTenantRead,
    update: canMutateTenant,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              admin: {
                description: 'Used for url paths, example: /tenant-slug/page-slug',
              },
              index: true,
              required: true,
            },
            {
              name: 'siteUrl',
              type: 'text',
              label: 'URL du site client',
              unique: true,
            },
          ],
        },
        {
          label: 'AI Strategy',
          fields: [
            {
              name: 'brandVoice',
              type: 'textarea',
              required: false,
              admin: {
                description: 'Describe the tone and style of the content.',
              },
            },
            {
              name: 'targetAudience',
              type: 'textarea',
              required: false,
            },
            {
              name: 'keywords',
              type: 'array',
              label: 'Keywords',
              fields: [
                {
                  name: 'keyword',
                  type: 'text',
                },
              ],
            },
            {
              name: 'staticPages',
              type: 'array',
              label: 'Static Pages',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                },
                {
                  name: 'url',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Custom Data',
          fields: [
            {
              name: 'customData',
              type: 'array',
              label: 'Custom Data',
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'public',
      type: 'checkbox',
      admin: {
        description: 'If checked, logging in is not required.',
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
  ],
}
