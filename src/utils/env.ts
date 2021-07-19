import { EOL } from 'os';
import path from 'path';
import fs from 'fs';

import AppConfig from '../config/app.config.json';
if (AppConfig.NODE_ENV === 'development') {
  fs.readFileSync(path.join(__dirname, '../../.env'))
    .toString()
    .split(EOL)
    .forEach((line) => (process.env[line.split('=')[0]] = line.split('=')[1]));
}
