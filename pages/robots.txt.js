import { buildAbsoluteUrl } from 'utilities';

export async function getServerSideProps({ res }) {
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /preview/',
    'Disallow: /search',
    `Sitemap: ${buildAbsoluteUrl('/sitemap.xml')}`,
  ].join('\n');

  res.statusCode = 200;
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(`${robots}\n`);
  res.end();

  return {
    props: {},
  };
}

export default function RobotsTxt() {
  return null;
}
