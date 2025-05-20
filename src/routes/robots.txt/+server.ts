// src/routes/robots.txt/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
  const content = `User-agent: *
Disallow:
Sitemap: https://svkit-project.vercel.app/sitemap.xml`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
