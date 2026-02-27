import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

import type {
  ListingIndexEntry,
  ListingsLoadResult,
  ListingValidationResult,
  StartupListing
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_REPO_ROOT = path.resolve(__dirname, '../../../');

function loadYamlFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf8');
  return YAML.parse(raw) as T;
}

function normalizeListing(listing: StartupListing): StartupListing {
  return {
    ...listing,
    startup_id: listing.startup_id.trim(),
    identity: {
      ...listing.identity,
      name: listing.identity.name.trim(),
      category: listing.identity.category.trim(),
      summary: listing.identity.summary.trim(),
      website: listing.identity.website.trim()
    },
    risks: listing.risks.map((risk) => risk.trim()),
    tech: {
      ...listing.tech,
      stack: listing.tech.stack.map((entry) => entry.trim())
    }
  };
}

export function loadAndValidateListings(repoRoot = DEFAULT_REPO_ROOT): ListingsLoadResult {
  const schemaPath = path.join(repoRoot, 'schemas', 'startupshop.schema.json');
  const indexPath = path.join(repoRoot, 'index.yaml');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const indexDoc = loadYamlFile<{ listings: ListingIndexEntry[] }>(indexPath);

  // Remove $schema to avoid AJV trying to resolve external meta-schema
  delete (schema as Record<string, unknown>)['$schema'];
  
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile<StartupListing>(schema);

  const listings: StartupListing[] = [];
  const validations: ListingValidationResult[] = [];

  for (const entry of indexDoc.listings) {
    const listingPath = path.join(repoRoot, entry.path);
    const parsed = loadYamlFile<StartupListing>(listingPath);
    const normalized = normalizeListing(parsed);

    const valid = validate(normalized);
    const errors = valid
      ? []
      : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message ?? 'invalid'}`);

    if (normalized.startup_id !== entry.startup_id) {
      errors.push(`startup_id mismatch: index has '${entry.startup_id}' but listing has '${normalized.startup_id}'`);
    }

    const finalValid = errors.length === 0;
    validations.push({
      startup_id: entry.startup_id,
      path: entry.path,
      valid: finalValid,
      errors
    });

    if (finalValid) {
      listings.push(normalized);
    }
  }

  return { listings, validations };
}
