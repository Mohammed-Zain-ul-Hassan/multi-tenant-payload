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
      <div className="container mx-auto py-10 max-w-4xl px-4">
        {data.featuredImage && (
          <div className="w-full h-96 relative mb-8 rounded-lg overflow-hidden">
            {/* Ideally verify if 'url' exists on featuredImage, assuming it's poplulated */}
            <img
              src={data.featuredImage.url}
              alt={data.featuredImage.alt || data.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <h1 className="text-5xl font-bold mb-6">{data.title}</h1>
        <div className="prose lg:prose-xl">
          {/* Rendering RichText is complex w/ Lexical. For now, JSON dump or basic text placeholder */}
          {/* Ideally use @payloadcms/richtext-lexical/react's RichText component or custom serializer */}
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(data.content, null, 2)}
          </pre>
          <p className="italic text-gray-500 mt-4">(RichText rendering requires a parser implementation)</p>
        </div>
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
