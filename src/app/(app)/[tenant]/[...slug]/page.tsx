import type { Where } from "payload";

import configPromise from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import React from "react";

import { RenderPage } from "../../../components/RenderPage";

// ...existing imports...

export default async function Page({
  params: paramsPromise,
}: {
  params: Promise<{ slug?: string[]; tenant: string }>;
}) {
  const params = await paramsPromise;
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  const tenantsQuery = await payload.find({
    collection: "tenants",
    overrideAccess: false,
    user,
    where: {
      slug: {
        equals: params.tenant,
      },
    },
  });

  const tenant = tenantsQuery.docs[0];

  if (!tenant) {
    return notFound();
  }

  const slug = params?.slug;
  const slugString = slug ? slug.join("/") : "home";

  // Try to find a blog post with this slug 
  const blogsQuery = await payload.find({
    collection: "blogs",
    where: {
      and: [
        {
          slug: {
            equals: slugString,
          },
        },
        {
          tenant: {
            equals: tenant.id,
          },
        },
      ],
    },
    depth: 1, // Populate user/author data
  });

  const blog = blogsQuery.docs[0];

  if (blog) {
    return <RenderPage data={blog} type="blog" />;
  }

  // If no blog found, maybe handle pages later... for now just return null 
  return <RenderPage data={null} />;
}
