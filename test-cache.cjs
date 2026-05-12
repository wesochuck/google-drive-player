const crypto = require('crypto');

const folders = Array.from({ length: 10000 }, (_, i) => `folder_${i}/`);
const accessKey = crypto.createHash('md5').update('folder_9999').digest('hex');

const start1 = performance.now();
let found1;
for (const folder of folders) {
  const folderName = folder.replace(/\/$/, '');
  const hash = crypto.createHash('md5').update(folderName).digest('hex');
  if (hash === accessKey) {
    found1 = folder;
    break;
  }
}
const end1 = performance.now();

const hashCache = new Map();
const start2 = performance.now();
let found2;
for (const folder of folders) {
  const folderName = folder.replace(/\/$/, '');
  let hash = hashCache.get(folderName);
  if (!hash) {
    hash = crypto.createHash('md5').update(folderName).digest('hex');
    hashCache.set(folderName, hash);
  }
  if (hash === accessKey) {
    found2 = folder;
    break;
  }
}
const end2 = performance.now();

const start3 = performance.now();
let found3;
for (const folder of folders) {
  const folderName = folder.replace(/\/$/, '');
  let hash = hashCache.get(folderName);
  if (!hash) {
    hash = crypto.createHash('md5').update(folderName).digest('hex');
    hashCache.set(folderName, hash);
  }
  if (hash === accessKey) {
    found3 = folder;
    break;
  }
}
const end3 = performance.now();

console.log('No cache:', end1 - start1, 'ms');
console.log('Cache cold:', end2 - start2, 'ms');
console.log('Cache warm:', end3 - start3, 'ms');
