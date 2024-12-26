// start.ts
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('ts-node/esm', pathToFileURL('./'));

// Now import your main application file
import './src/index.ts'; // Adjust the path to your main file
