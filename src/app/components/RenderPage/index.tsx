// import type { Page } from '@payload-types'

import React from "react";

export const RenderPage = ({ data, type }: { data: any; type?: string }) => {
  if (!data) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold">404 - Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    );
  }

  if (type === "blog") {
    return (
      <div className="container mx-auto py-16 px-6 lg:px-12 max-w-4xl">
        {data.featuredImage && (
          <div className="premium-flex-center mb-16">
            <div className="premium-image-wrapper">
              <img
                src={data.featuredImage.url}
                alt={data.featuredImage.alt || data.title}
                className="premium-featured-img"
              />
            </div>
            {data.featuredImage.caption && (
              <p className="mt-6 text-base text-gray-500 italic text-center">{data.featuredImage.caption}</p>
            )}
          </div>
        )}
        <h1 className="text-5xl lg:text-6xl font-extrabold mb-10 tracking-tight leading-tight">{data.title}</h1>
        <div
          className="prose lg:prose-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content_html }}
        />

        {/* Author Section */}
        {/* Temporarily hidden as requested
        {data.user && typeof data.user === 'object' && (
          <div className="author-bio mt-12 p-8 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                {(data.user.username || data.user.email || 'AU').substring(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Meet the Author: {data.user.username || data.user.email || 'Anonymous Author'}</h3>
                {data.user.bio && <p className="text-gray-600 mt-1 max-w-2xl">{data.user.bio}</p>}

                {data.user.socialLinks && (
                  <div className="flex gap-4 mt-4">
                    {Object.entries(data.user.socialLinks).map(([platform, url]) => {
                      if (!url) return null;
                      return (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors capitalize"
                        >
                          {platform}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        */}
      </div>
    );
  }

  return (
    <React.Fragment>
      <h2>Here you can decide how you would like to render the page data!</h2>
      <code>{JSON.stringify(data)}</code>
    </React.Fragment>
  );
};
