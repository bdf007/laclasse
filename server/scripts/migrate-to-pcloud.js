/**
 * Script de migration : envoie vers pCloud toutes les images encore
 * stockées en Base64 dans Mongo (photos de profil, bibliothèque,
 * vinothèque), et remplace le champ Base64 par pcloudFileId.
 *
 * À lancer depuis le dossier "server" (local et prod partagent la même
 * base, donc pas besoin de le déployer sur le serveur) :
 *
 *   node scripts/migrate-to-pcloud.js
 *
 * Sûr à relancer plusieurs fois : seules les entrées avec le champ Base64
 * ET sans pcloudFileId sont traitées, les autres sont ignorées.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connection = require("../config/db");
const { uploadBase64Image } = require("../services/pcloud");

const User = require("../models/userlogin");
const Book = require("../models/books");
const Wine = require("../models/wine");

const TARGETS = [
  {
    model: User,
    base64Field: "profilePictureData",
    pcloudField: "profilePicturePcloudId",
    subfolder: "photos-profil",
    prefix: "profile",
    label: "Photos de profil",
    nameOf: (doc) => `${doc.firstname} ${doc.lastname}`,
  },
  {
    model: Book,
    base64Field: "imageData",
    pcloudField: "pcloudFileId",
    subfolder: "bibliotheque",
    prefix: "book",
    label: "Bibliothèque",
    nameOf: (doc) => doc.title,
  },
  {
    model: Wine,
    base64Field: "pictureData",
    pcloudField: "pcloudFileId",
    subfolder: "vinotheque",
    prefix: "wine",
    label: "Vinothèque",
    nameOf: (doc) => doc.nomDuChateau,
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function migrateCollection({
  model,
  base64Field,
  pcloudField,
  subfolder,
  prefix,
  label,
  nameOf,
}) {
  console.log(`\n=== ${label} ===`);

  const query = {
    [base64Field]: { $exists: true, $ne: null },
    $or: [{ [pcloudField]: { $exists: false } }, { [pcloudField]: null }],
  };

  const toMigrate = await model.find(query);

  if (toMigrate.length === 0) {
    console.log("Rien à migrer.");
    return { success: 0, failed: 0 };
  }

  console.log(`${toMigrate.length} entrée(s) à migrer.`);

  let success = 0;
  let failed = 0;

  for (const doc of toMigrate) {
    try {
      const fileid = await uploadBase64Image(
        doc[base64Field],
        `${prefix}-${doc._id}.webp`,
        subfolder,
      );

      doc[pcloudField] = fileid;
      doc[base64Field] = undefined;
      await doc.save();

      success += 1;
      console.log(`  OK  ${doc._id} (${nameOf(doc) || "sans titre"})`);
    } catch (error) {
      failed += 1;
      console.error(`  ECHEC ${doc._id} :`, error.message);
    }

    // Petite pause entre chaque upload, pour ne pas bombarder l'API pCloud
    await wait(300);
  }

  return { success, failed };
}

async function main() {
  connection();
  await mongoose.connection.asPromise();
  console.log("Connecté à MongoDB.");

  const totals = { success: 0, failed: 0 };

  for (const target of TARGETS) {
    const result = await migrateCollection(target);
    totals.success += result.success;
    totals.failed += result.failed;
  }

  console.log("\n=== Résumé ===");
  console.log(`Migrées avec succès : ${totals.success}`);
  console.log(`Échecs : ${totals.failed}`);

  await mongoose.disconnect();
  process.exit(totals.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Erreur fatale :", error);
  process.exit(1);
});
