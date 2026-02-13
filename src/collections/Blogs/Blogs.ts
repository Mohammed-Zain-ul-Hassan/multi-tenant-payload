import { CollectionConfig } from 'payload'
import {
  HTMLConverterFeature,
  lexicalEditor,
  lexicalHTML,
  EXPERIMENTAL_TableFeature as TableFeature,
  BlocksFeature,
  InlineCodeFeature,
  CodeBlock,
} from '@payloadcms/richtext-lexical'
import { CustomHTMLBlock } from '../../blocks/CustomHTMLBlock'
import { FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { preventTenantChange } from './hooks/preventTenantChange'
import { isTenantOwner } from './access/isTenantOwner'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import generateSlug from './hooks/generateSlug'

const Blogs: CollectionConfig = {
  slug: 'blogs',
  labels: {
    singular: 'Blog',
    plural: 'Blogs',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: "Titre de l'article",
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true, // Un blog doit obligatoirement appartenir à un tenant
      // On limitera la sélection à un seul tenant,
      // car un blog ne peut appartenir qu'à un seul tenant.
      hasMany: false,
      hooks: {
        beforeChange: [preventTenantChange],
      },
      admin: {
        condition: (data, siblingData, { user }) => !!user?.roles?.includes('super-admin'),
        position: 'sidebar', // Optionnel, pour afficher dans la barre latérale
      },
    },
    {
      name: 'slug', // Champ pour le slug
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar', // Optionnel, pour afficher dans la barre latérale
      },
      hooks: {
        beforeValidate: [generateSlug], // Utilisation du hook importé
      },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'themes',
      label: "Theme de l'article",
    },
    {
      name: 'generateMetaButton',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/collections/Blogs/ui/GenerateAIButton#GenerateAIButton',
        },
        custom: {
          type: 'meta',
          label: 'Generate Meta with AI',
        },
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      required: false, // Changed to false to allow generation
      label: "Description de l'article - Utile pour le référencement",
      maxLength: 160,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media', // Reference the Media collection
      label: "Image de l'article",
      required: true,
    },
    {
      name: 'aiGenerator',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/components/GenerateArticleButton#GenerateArticleButton',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: false, // Allow generation
      label: 'Contenu',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          HTMLConverterFeature({
            converters: ({ defaultConverters }) => [
              ...defaultConverters,
              {
                converter: ({ node }: any) => {
                  return `<pre class="code-block"><code class="language-${node.fields.language}">${node.fields.code}</code></pre>`
                },
                nodeTypes: ['block'],
              },
              {
                converter: ({ node }: any) => {
                  if (node.fields?.blockType === 'custom-html') {
                    return node.fields.code || ''
                  }
                  return ''
                },
                nodeTypes: ['block'],
              },
            ],
          }),
          TableFeature(),
          InlineCodeFeature(),
          BlocksFeature({ blocks: [CustomHTMLBlock, CodeBlock()] }),
        ],
      }),
    },
    lexicalHTML('content', { name: 'content_html' }),
    {
      name: 'generateKeywordsButton',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/collections/Blogs/ui/GenerateAIButton#GenerateAIButton',
        },
        custom: {
          type: 'keywords',
          label: 'Generate Keywords with AI',
        },
      },
    },
    {
      name: 'keywords',
      type: 'array',
      label: "Mot en rapport avec l'article - Utile pour le référencement",
      fields: [
        {
          name: 'keyword',
          type: 'text',
          label: 'Mot Clé',
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: "Auteur de l'article",
      admin: {
        position: 'sidebar',
      },
    },
  ],
  access: {
    create: ({ req }) => {
      const user = req.user
      if (!user) {
        return false
      }

      // super admins can update pages for any tenant
      if (isSuperAdmin({ req })) {
        return true
      }

      // tenant admins can update
      return (
        user.tenants?.some((accessRow) => {
          return (
            accessRow.roles?.includes('tenant-admin') || accessRow.roles?.includes('tenant-viewer')
          )
        }) || false
      )
    },
    read: ({ req }) => {
      // Si c'est un super-admin, autorise l'accès à tous les blogs
      if (isSuperAdmin({ req })) {
        return true
      }

      const user = req.user

      // Si l'utilisateur est connecté, filtre les blogs par ses tenants
      if (user) {
        return {
          or: [
            {
              tenant: {
                in:
                  user.tenants
                    ?.filter(
                      (tenant) =>
                        tenant.roles?.includes('tenant-admin') ||
                        tenant.roles?.includes('tenant-viewer'),
                    ) // Filtre les tenants où l'utilisateur est tenant-admin ou tenant-viewer
                    .map(({ tenant }) => (typeof tenant === 'string' ? tenant : tenant.id)) || [],
              },
            },
            {
              tenant: {
                exists: false,
              },
            },
          ],
        }
      }

      // Si l'utilisateur n'est pas connecté, n'autorise pas l'accès
      return false
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) {
        return false
      }

      // super admins can update pages for any tenant
      if (isSuperAdmin({ req })) {
        return true
      }

      // tenant admins can update
      return (
        user.tenants?.some((accessRow) => {
          return (
            accessRow.roles?.includes('tenant-admin') || accessRow.roles?.includes('tenant-viewer')
          )
        }) || false
      )
    },
    delete: ({ req }) => {
      return isSuperAdmin({ req }) || isTenantOwner({ req })
    },
  },
}

export default Blogs
