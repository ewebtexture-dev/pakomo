import path from 'node:path';
export function dataDirectory(){if(process.env.DATA_DIRECTORY)return process.env.DATA_DIRECTORY;const match=process.cwd().replaceAll('\\','/').match(/^(\/home\/[^/]+\/domains\/[^/]+)\/hbuilds\//);return match?path.join(match[1],'private-data'):path.join(process.cwd(),'.data');}
