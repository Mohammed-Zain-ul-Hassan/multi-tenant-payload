import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import { Tenants } from './collections/Tenants';
import Users from './collections/Users';
import Blogs from './collections/Blogs/Blogs';
import Media from './collections/media/Media';
import Themes from './collections/Themes/Themes';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Ensure the server URL is set correctly
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  serverURL, // ✅ Added this to generate correct media URLs
  admin: {
    components: {
      afterNavLinks: ['/src/components/TenantSelector#TenantSelectorRSC'],
    },
    user: 'users',
  },
  collections: [Users, Tenants, Blogs, Themes, Media],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI as string,
  }),
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
