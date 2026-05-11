const crypto = require('crypto');
const { performance } = require('perf_hooks');

const FOLDER_COUNT = 10000;
const folders = Array.from({ length: FOLDER_COUNT }, (_, i) => `folder_${i}/`);
const targetFolder = `folder_${FOLDER_COUNT - 1}`;
const accessKey = crypto.createHash('md5').update(targetFolder).digest('hex');

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

const folderToHashCache = new Map();
function simulateNewCode() {
  const start = performance.now();
  let basePrefix = '';

  for (const folder of folders) {
    let hash = folderToHashCache.get(folder);
    if (!hash) {
      const folderName = folder.replace(/\/$/, '');
      hash = crypto.createHash('md5').update(folderName).digest('hex');
      folderToHashCache.set(folder, hash);
    }

    if (hash === accessKey) {
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

// Test with invalid access key
const invalidKey = "invalid_key_1234567890abcdef123456";
console.log("\nRunning Old Code (Invalid Key)...");
const startOldInv = performance.now();
for (const folder of folders) {
  const folderName = folder.replace(/\/$/, '');
  const hash = crypto.createHash('md5').update(folderName).digest('hex');
  if (hash === invalidKey) { break; }
}
console.log(`Old Code Invalid Key Duration: ${(performance.now() - startOldInv).toFixed(3)} ms`);

console.log("\nRunning New Code (Invalid Key, Warm Cache)...");
const startNewInv = performance.now();
for (const folder of folders) {
  let hash = folderToHashCache.get(folder);
  if (!hash) {
    const folderName = folder.replace(/\/$/, '');
    hash = crypto.createHash('md5').update(folderName).digest('hex');
    folderToHashCache.set(folder, hash);
  }
  if (hash === invalidKey) { break; }
}
console.log(`New Code Invalid Key Warm Duration: ${(performance.now() - startNewInv).toFixed(3)} ms`);
