// controllers/public/seo.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const APP_URL = process.env.APP_URL || 'https://transcompneus.fr';
const DEPTS = ['75','77','78','91','92','93','94','95'];

exports.sitemap = async (req, res) => {
  const tires = await prisma.tire.findMany({ where: { active: true }, select: { id: true, updatedAt: true } });

  const staticUrls = [
    ['/', '1.0', 'weekly'],
    ['/catalogue', '0.9', 'daily'],
    ['/services', '0.8', 'monthly'],
    ['/reservation', '0.9', 'weekly'],
    ['/contact', '0.6', 'monthly'],
    ['/faq', '0.5', 'monthly'],
  ];
  DEPTS.forEach(d => staticUrls.push([`/pneus-domicile/${d}`, '0.7', 'monthly']));

  const urls = [
    ...staticUrls.map(([loc, prio, freq]) =>
      `<url><loc>${APP_URL}${loc}</loc><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`
    ),
    ...tires.map(t =>
      `<url><loc>${APP_URL}/catalogue/${t.id}</loc><lastmod>${t.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    ),
  ];

  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
};

exports.robots = (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${APP_URL}/sitemap.xml\n`);
};
