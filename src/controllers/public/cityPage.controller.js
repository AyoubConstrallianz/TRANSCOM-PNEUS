// controllers/public/cityPage.controller.js
// Pages SEO par ville — "Dépannage pneu à domicile à [Ville]"

const prisma = require('../../utils/prisma');
const { CITY_BY_SLUG, CITIES_BY_DEPT } = require('../../data/cities');

async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(s => [s.key, s.value]));
}

exports.cityPage = async (req, res) => {
  const entry = CITY_BY_SLUG[req.params.slug];
  if (!entry) return res.redirect('/depannage-pneu');

  const { city, dept, deptName } = entry;
  const settings = await getSettings();
  const nearbyCities = (CITIES_BY_DEPT[dept] || []).filter(c => c !== city).slice(0, 12);

  res.render('public/seo/city', {
    title: `Dépannage Pneu à Domicile à ${city} — TRANSCOM PNEUS 7j/7 24h/24`,
    metaDescription: `Dépannage pneu crevé à domicile à ${city} (${dept}). Montage, réparation crevaison, soudure. Intervention rapide 7j/7 et 24h/24. TRANSCOM PNEUS.`,
    settings,
    city,
    dept,
    deptName,
    nearbyCities,
  });
};
