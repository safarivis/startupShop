import { loadAndValidateListings } from './registry.js';

const result = loadAndValidateListings();
const invalid = result.validations.filter((entry) => !entry.valid);

if (invalid.length > 0) {
  console.error(`Listing validation failed: ${invalid.length} invalid listing(s).`);
  for (const entry of invalid) {
    console.error(`- ${entry.startup_id} (${entry.path})`);
    for (const err of entry.errors) {
      console.error(`  - ${err}`);
    }
  }
  process.exit(1);
}

console.log(`Listing validation passed: ${result.listings.length} listing(s) are valid.`);
