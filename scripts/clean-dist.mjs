// technology stolen from the legendary Miles Petrov

import { rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
