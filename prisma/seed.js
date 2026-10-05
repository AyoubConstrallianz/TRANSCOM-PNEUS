// prisma/seed.js — Données de démonstration TRANSCOM PNEUS
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@transcompneus.fr';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: hash, name: 'Administrateur', role: 'superadmin' },
  });
  console.log(`  ✔ Admin créé : ${adminEmail}`);

  // ── Zones IDF ──────────────────────────────────────────────────────────────
  const zones = [
    { dept: '75', name: 'Paris',                travelFee: 0   },
    { dept: '77', name: 'Seine-et-Marne',        travelFee: 30  },
    { dept: '78', name: 'Yvelines',              travelFee: 25  },
    { dept: '91', name: 'Essonne',               travelFee: 20  },
    { dept: '92', name: 'Hauts-de-Seine',        travelFee: 5   },
    { dept: '93', name: 'Seine-Saint-Denis',     travelFee: 10  },
    { dept: '94', name: 'Val-de-Marne',          travelFee: 10  },
    { dept: '95', name: "Val-d'Oise",            travelFee: 20  },
  ];
  for (const z of zones) {
    await prisma.zone.upsert({ where: { dept: z.dept }, update: {}, create: z });
  }
  console.log(`  ✔ ${zones.length} zones créées`);

  // ── Services ───────────────────────────────────────────────────────────────
  // Supprimer les anciens services pour repartir propre
  await prisma.service.deleteMany({});

  const services = [
    // ── Montage de pneu à domicile
    { category: 'Montage de pneu à domicile', name: 'Changement de pneus',      description: 'Démontage et montage de vos pneus directement à votre domicile.', priceLabel: 'Prix sur devis' },
    { category: 'Montage de pneu à domicile', name: 'Équilibrage',               description: 'Équilibrage précis de vos roues pour éliminer les vibrations.', priceLabel: 'Prix sur devis' },
    { category: 'Montage de pneu à domicile', name: 'Gonflage',                  description: 'Vérification et ajustement de la pression de vos pneus.', priceLabel: 'Prix sur devis' },
    { category: 'Montage de pneu à domicile', name: 'Réparation de crevaison',   description: 'Réparation rapide d\'un pneu crevé sans remplacement.', priceLabel: 'Prix sur devis' },
    // ── Soudure
    { category: 'Soudure', name: 'Soudure acier',                description: 'Soudure professionnelle sur pièces acier.', priceLabel: 'Prix sur devis' },
    { category: 'Soudure', name: 'Soudure dépannage',            description: 'Intervention rapide pour soudures urgentes.', priceLabel: 'Prix sur devis' },
    { category: 'Soudure', name: 'Réparation de pièces métalliques', description: 'Remise en état de vos pièces métalliques abîmées.', priceLabel: 'Prix sur devis' },
    { category: 'Soudure', name: 'Travaux sur mesure',           description: 'Fabrication et assemblage métallique selon vos besoins.', priceLabel: 'Prix sur devis' },
    // ── Achat-vente
    { category: 'Achat-vente', name: 'Pneus neufs et d\'occasion', description: 'Large choix de pneus neufs et d\'occasion pour tous véhicules.', priceLabel: 'Prix sur devis' },
    { category: 'Achat-vente', name: 'Jantes',                   description: 'Vente de jantes acier et aluminium.', priceLabel: 'Prix sur devis' },
    { category: 'Achat-vente', name: 'Accessoires auto',         description: 'Tout ce qu\'il faut pour entretenir votre véhicule.', priceLabel: 'Prix sur devis' },
    { category: 'Achat-vente', name: 'Pièces métalliques',       description: 'Vente de pièces métalliques neuves et d\'occasion.', priceLabel: 'Prix sur devis' },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log(`  ✔ ${services.length} services créés`);

  // ── Pneus (20 références) ──────────────────────────────────────────────────
  const tires = [
    // Michelin
    { brand: 'Michelin', model: 'Pilot Sport 4',    width: 205, ratio: 55, diameter: 16, season: 'summer',    buyPrice: 80,  sellPrice: 129, stock: 12 },
    { brand: 'Michelin', model: 'Pilot Sport 4',    width: 225, ratio: 45, diameter: 17, season: 'summer',    buyPrice: 95,  sellPrice: 149, stock: 8  },
    { brand: 'Michelin', model: 'CrossClimate 2',   width: 205, ratio: 55, diameter: 16, season: 'allseason', buyPrice: 90,  sellPrice: 139, stock: 10 },
    { brand: 'Michelin', model: 'Alpin 6',          width: 205, ratio: 55, diameter: 16, season: 'winter',    buyPrice: 85,  sellPrice: 135, stock: 6  },
    // Bridgestone
    { brand: 'Bridgestone', model: 'Turanza T005',  width: 205, ratio: 55, diameter: 16, season: 'summer',    buyPrice: 75,  sellPrice: 119, stock: 14 },
    { brand: 'Bridgestone', model: 'Blizzak LM005', width: 205, ratio: 55, diameter: 16, season: 'winter',    buyPrice: 80,  sellPrice: 125, stock: 5  },
    { brand: 'Bridgestone', model: 'Weather Control', width: 215, ratio: 60, diameter: 16, season: 'allseason', buyPrice: 78, sellPrice: 120, stock: 9 },
    // Continental
    { brand: 'Continental', model: 'PremiumContact 6', width: 205, ratio: 55, diameter: 16, season: 'summer', buyPrice: 78, sellPrice: 122, stock: 11 },
    { brand: 'Continental', model: 'WinterContact TS870', width: 205, ratio: 55, diameter: 16, season: 'winter', buyPrice: 82, sellPrice: 128, stock: 7 },
    { brand: 'Continental', model: 'AllSeasonContact', width: 205, ratio: 55, diameter: 16, season: 'allseason', buyPrice: 85, sellPrice: 132, stock: 8 },
    // Goodyear
    { brand: 'Goodyear', model: 'EfficientGrip 2',  width: 205, ratio: 55, diameter: 16, season: 'summer',    buyPrice: 72,  sellPrice: 115, stock: 15 },
    { brand: 'Goodyear', model: 'Vector 4Seasons',  width: 205, ratio: 55, diameter: 16, season: 'allseason', buyPrice: 82,  sellPrice: 128, stock: 10 },
    { brand: 'Goodyear', model: 'UltraGrip 9+',     width: 205, ratio: 55, diameter: 16, season: 'winter',    buyPrice: 78,  sellPrice: 122, stock: 4  },
    // Pirelli
    { brand: 'Pirelli', model: 'P7 Cinturato',      width: 225, ratio: 45, diameter: 17, season: 'summer',    buyPrice: 88,  sellPrice: 140, stock: 8  },
    { brand: 'Pirelli', model: 'Sottozero 3',        width: 225, ratio: 45, diameter: 17, season: 'winter',    buyPrice: 92,  sellPrice: 145, stock: 3  },
    // Hankook
    { brand: 'Hankook', model: 'Ventus Prime 4',    width: 205, ratio: 55, diameter: 16, season: 'summer',    buyPrice: 55,  sellPrice: 89,  stock: 20 },
    { brand: 'Hankook', model: 'Kinergy 4S2',        width: 205, ratio: 55, diameter: 16, season: 'allseason', buyPrice: 58,  sellPrice: 92,  stock: 16 },
    // Nokian
    { brand: 'Nokian', model: 'Wetproof',            width: 205, ratio: 55, diameter: 16, season: 'summer',    buyPrice: 60,  sellPrice: 95,  stock: 12 },
    // Falken
    { brand: 'Falken', model: 'Ziex ZE310',          width: 205, ratio: 55, diameter: 16, season: 'summer',    buyPrice: 45,  sellPrice: 72,  stock: 25 },
    { brand: 'Falken', model: 'Eurowinter HS01',     width: 205, ratio: 55, diameter: 16, season: 'winter',    buyPrice: 48,  sellPrice: 76,  stock: 18 },
  ];

  let created = 0;
  for (const t of tires) {
    const existing = await prisma.tire.findFirst({
      where: { brand: t.brand, model: t.model, width: t.width, ratio: t.ratio, diameter: t.diameter },
    });
    if (!existing) {
      await prisma.tire.create({ data: t });
      created++;
    }
  }
  console.log(`  ✔ ${created} pneus créés (${tires.length - created} déjà existants)`);

  // ── Paramètres par défaut ──────────────────────────────────────────────────
  const settings = [
    { key: 'company_name',    value: 'TRANSCOM PNEUS'                      },
    { key: 'company_phone',   value: process.env.COMPANY_PHONE || '+33 1 XX XX XX XX' },
    { key: 'company_whatsapp',value: process.env.COMPANY_WHATSAPP || '+33XXXXXXXXX'   },
    { key: 'company_email',   value: process.env.COMPANY_EMAIL  || 'contact@transcompneus.fr' },
    { key: 'company_address', value: 'Île-de-France'             },
    { key: 'opening_hours',   value: 'Lundi–Samedi : 8h–19h | Dimanche : 9h–17h (urgences)' },
    { key: 'slots',           value: '08:00,09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00' },
    { key: 'hero_title',      value: 'Le spécialiste du pneu à domicile en Île-de-France'  },
    { key: 'hero_subtitle',   value: 'Montage, réparation, équilibrage — on se déplace chez vous en moins de 2h' },
    { key: 'meta_description',value: 'TRANSCOM PNEUS : vente et montage de pneus à domicile en Île-de-France (75, 77, 78, 91, 92, 93, 94, 95). Intervention rapide, prix clairs.' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log(`  ✔ ${settings.length} paramètres créés`);

  // ── Avis clients ───────────────────────────────────────────────────────────
  const reviews = [
    { name: 'Sophie M.',    rating: 5, comment: 'Intervention ultra-rapide, technicien très professionnel. Je recommande vivement !', published: true },
    { name: 'Karim B.',     rating: 5, comment: 'Pneu crevé à 7h du matin, ils étaient là à 8h30. Prix honnêtes, travail soigné.', published: true },
    { name: 'Marie-Line T.',rating: 5, comment: 'Super service ! Montage des 4 pneus en 45 minutes devant chez moi. Parfait.', published: true },
    { name: 'Pierre D.',    rating: 4, comment: 'Très bon rapport qualité/prix. Pneus Michelin posés sans aucun problème.', published: true },
    { name: 'Amina R.',     rating: 5, comment: 'Dépannage d\'urgence sur l\'A6, ils sont venus en moins d\'une heure. Merci !', published: true },
  ];
  for (const r of reviews) {
    const existing = await prisma.review.findFirst({ where: { name: r.name } });
    if (!existing) await prisma.review.create({ data: r });
  }
  console.log(`  ✔ ${reviews.length} avis clients créés`);

  console.log('\n✅ Seed terminé avec succès !');
  console.log(`   → Connexion admin : ${adminEmail} / ${adminPassword}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
