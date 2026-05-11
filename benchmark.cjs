const crypto = require('crypto');
const { performance } = require('perf_hooks');

const FOLDER_COUNT = 10000;
const folders = Array.from({ length: FOLDER_COUNT }, (_, i) => `folder_${i}/`);
const targetFolder = `folder_${FOLDER_COUNT - 1}`;
const accessKey = crypto.createHash('md5').update(targetFolder).digest('hex');

// Mock request
const req = { query: { guid: accessKey, subpath: '' } };

function simulateOldCode() {
  const start = performance.now();
  let basePrefix = '';
  for (const folder of folders) {
    const folderName = folder.replace(/\/$/, '');
    const hash = crypto.createHash('md5').update(folderName).digest('hex');
    if (hash === accessKey) {
      basePrefix = folder;
      break;
    }
  }
  const end = performance.now();
  return { duration: end - start, basePrefix };
}

const hashCache = new Map();
function simulateNewCode() {
  const start = performance.now();
  let basePrefix = '';

  // ensure accessKey is string and right length for timingSafeEqual
  const accessKeyBuffer = Buffer.from(accessKey);

  for (const folder of folders) {
    const folderName = folder.replace(/\/$/, '');
    let hash = hashCache.get(folderName);
    if (!hash) {
      hash = crypto.createHash('md5').update(folderName).digest('hex');
      hashCache.set(folderName, hash);
    }
    const hashBuffer = Buffer.from(hash);

    // Check timing safe equality if lengths match
    if (hashBuffer.length === accessKeyBuffer.length && crypto.timingSafeEqual(hashBuffer, accessKeyBuffer)) {
      basePrefix = folder;
      break;
    }
  }
  const end = performance.now();
  return { duration: end - start, basePrefix };
}

console.log("Running Old Code Baseline...");
const oldRes = simulateOldCode();
console.log(`Old Code Duration: ${oldRes.duration.toFixed(3)} ms`);

console.log("\nRunning New Code (Cold Cache)...");
const newResCold = simulateNewCode();
console.log(`New Code Cold Duration: ${newResCold.duration.toFixed(3)} ms`);

console.log("\nRunning New Code (Warm Cache)...");
const newResWarm = simulateNewCode();
console.log(`New Code Warm Duration: ${newResWarm.duration.toFixed(3)} ms`);
