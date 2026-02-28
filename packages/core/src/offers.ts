import fs from 'node:fs';
import path from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { resolveRepoRoot } from './registry';

export interface OfferPayload {
  startup_id: string;
  buyer_name: string;
  buyer_email: string;
  offer_amount_usd: number;
  message: string;
}

export interface OfferValidationResult {
  valid: boolean;
  data: OfferPayload;
  errors: string[];
}

const EMPTY_OFFER: OfferPayload = {
  startup_id: '',
  buyer_name: '',
  buyer_email: '',
  offer_amount_usd: 0,
  message: ''
};

export function validateOfferPayload(input: unknown): OfferValidationResult {
  const repoRoot = resolveRepoRoot();
  const schemaPath = path.join(repoRoot, 'schemas', 'offer.schema.json');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  delete (schema as Record<string, unknown>)['$schema'];

  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile<OfferPayload>(schema);

  const valid = validate(input);
  const errors = valid
    ? []
    : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message ?? 'invalid'}`);

  if (!valid) {
    return {
      valid: false,
      data: EMPTY_OFFER,
      errors
    };
  }

  const data = input as OfferPayload;
  return { valid: true, data, errors: [] };
}
