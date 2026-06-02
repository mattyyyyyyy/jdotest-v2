#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const text = readFileSync(process.argv[2], 'utf8');
const match = text.match(/buildConfigField\("String", "API_BASE", "\\"([^"]+)\\""\)/);
if (!match) throw new Error('API_BASE not found in app/build.gradle.kts');
process.stdout.write(match[1]);
