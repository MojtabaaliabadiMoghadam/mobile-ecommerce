import "dotenv/config";

async function main() {
  const { isSeeded, runSeed, ADMIN_EMAIL, ADMIN_PASSWORD } = await import("../src/lib/seed");
  if (await isSeeded()) {
    console.log("Database already seeded. Skipping.");
  } else {
    await runSeed();
    console.log("✅ Seed completed.");
  }
  console.log(`Admin login → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
