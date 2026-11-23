import {Config} from '@remotion/cli/config';

// The container ships a pre-installed headless Chromium; use it instead of downloading one.
const HEADLESS = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
import fs from 'node:fs';
if (fs.existsSync(HEADLESS)) Config.setBrowserExecutable(HEADLESS);

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('swangle');
