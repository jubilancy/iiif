import artic from './artic.js';
import wellcome from './wellcome.js';
import archive from './archive.js';

export const providers = [artic, wellcome, archive];
export const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));
