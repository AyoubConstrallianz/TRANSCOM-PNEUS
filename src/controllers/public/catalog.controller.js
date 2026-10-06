// controllers/public/catalog.controller.js

const prisma = require('../../utils/prisma');

exports.catalog = async (req, res) => {
  try {
    const { brand, season, width, ratio, diameter, maxPrice, q } = req.query;
    const where = { active: true };
    if (brand)    where.brand  = brand;
    if (season)   where.season = season;
    if (width)    where.width  = parseInt(width);
    if (ratio)    where.ratio  = parseInt(ratio);
    if (diameter) where.diameter = parseInt(diameter);
    if (maxPrice) where.sellPrice = { lte: parseFloat(maxPrice) };
    if (q)        where.OR = [{ brand: { contains: q } }, { model: { contains: q } }];

    const [tires, brands, settings] = await Promise.all([
      prisma.tire.findMany({ where, orderBy: [{ brand: 'asc' }, { sellPrice: 'asc' }] }),
      prisma.tire.findMany({ distinct: ['brand'], select: { brand: true }, where: { active: true }, orderBy: { brand: 'asc' } }),
      prisma.setting.findMany(),
    ]);
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    // Dimensions disponibles pour les filtres
    const widths     = [...new Set((await prisma.tire.findMany({ distinct: ['width'],    select: { width: true },    where: { active: true } })).map(t => t.width))].sort((a,b) => a-b);
    const ratios     = [...new Set((await prisma.tire.findMany({ distinct: ['ratio'],    select: { ratio: true },    where: { active: true } })).map(t => t.ratio))].sort((a,b) => a-b);
    const diameters  = [...new Set((await prisma.tire.findMany({ distinct: ['diameter'],select: { diameter: true }, where: { active: true } })).map(t => t.diameter))].sort((a,b) => a-b);

    res.render('public/catalog', {
      title: 'Catalogue pneus — TRANSCOM PNEUS',
      metaDescription: 'Trouvez votre pneu par dimension, marque ou saison. Livraison et montage à domicile en Île-de-France.',
      tires, brands, widths, ratios, diameters, query: req.query, settings: settingsMap,
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};

exports.tire = async (req, res) => {
  try {
    const tire = await prisma.tire.findUnique({ where: { id: parseInt(req.params.id), active: true } });
    if (!tire) return res.status(404).render('public/404', { title: 'Pneu introuvable' });
    const similar = await prisma.tire.findMany({
      where: { active: true, season: tire.season, id: { not: tire.id } },
      take: 4, orderBy: { brand: 'asc' },
    });
    const settings = Object.fromEntries((await prisma.setting.findMany()).map(s => [s.key, s.value]));
    const dim = `${tire.width}/${tire.ratio} R${tire.diameter}`;
    res.render('public/tire', {
      title: `${tire.brand} ${tire.model} ${dim} — TRANSCOM PNEUS`,
      metaDescription: `Achetez le pneu ${tire.brand} ${tire.model} ${dim} au meilleur prix. Montage à domicile en Île-de-France par TRANSCOM PNEUS.`,
      tire, similar, settings,
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};
