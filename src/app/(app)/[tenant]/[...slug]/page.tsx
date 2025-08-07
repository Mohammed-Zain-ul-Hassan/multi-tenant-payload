import type { Where } from "payload";

import configPromise from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import React from "react";

import { RenderPage } from "../../../components/RenderPage";

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

  const slug = params?.slug;

  if (tenantsQuery.docs.length === 0) {
    redirect(
      `/${params.tenant}/login?redirect=${encodeURIComponent(
        `/${params.tenant}${slug ? `/${slug.join("/")}` : ""}`
      )}`
    );
  }

  const slugConstraint: Where = slug
    ? {
        slug: {
          equals: slug.join("/"),
        },
      }
    : {
        or: [
          {
            slug: {
              equals: "",
            },
          },
          {
            slug: {
              equals: "home",
            },
          },
          {
            slug: {
              exists: false,
            },
          },
        ],
      };

  // Removed the `pages` collection query

  // Render a fallback or default view if needed
  return <RenderPage data={null} />;
}
