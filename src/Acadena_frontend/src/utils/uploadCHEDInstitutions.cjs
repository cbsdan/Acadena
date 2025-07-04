const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { HttpAgent, Actor } = require('@dfinity/agent');
let idlFactory, canisterId;
(async () => {
  const mod = await import('../../../declarations/Acadena_backend/index.js');
  idlFactory = mod.idlFactory;
  canisterId = mod.canisterId;

  const agent = new HttpAgent({ host: 'https://icp0.io' });

  // Add this line to trust the local replica's root key
  // if (process.env.DFX_NETWORK !== "ic") {
  //   await agent.fetchRootKey();
  // }

  const backend = Actor.createActor(idlFactory, { agent, canisterId });

  const csvPath = path.resolve(__dirname, '../../public/data/ched-institutions.csv');
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', async (row) => {
    const inst = {
      region: row['REGION']?.trim() || "",
      name: row[' INSTITUTION NAME']?.trim() || "",
      province: row[' PROVINCE']?.trim() || "",
      city: row[' MUNICIPALITY/CITY']?.trim() || "",
      website: row[' WEBSITE ADDRESS']?.trim() || "",
      contact: row[' FAX/TELEPHONE NO.']?.trim() || ""
    };
      try {
        await backend.addCHEDInstitution(inst);
        console.log('Added:', inst.name);
      } catch (e) {
        console.error('Error:', e);
      }
    })
    .on('end', () => {
      console.log('Upload complete');
    });
})();