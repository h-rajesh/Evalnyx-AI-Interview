const { Client } = require('pg');
const { Redis } = require('@upstash/redis');
const dns = require('dns');
const path = require('path');

// Load .env relative to this file's directory (up one level to project root)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbUrlFull = process.env.DATABASE_URL;
const dbUrlNoChannelBinding = dbUrlFull ? dbUrlFull.replace('&channel_binding=require', '').replace('?channel_binding=require', '') : '';

console.log('--- Network Diagnosis ---');
console.log('DATABASE_URL:', dbUrlFull ? '(Present)' : '(Missing)');
console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '(Present)' : '(Missing)');

// 1. DNS Resolution
function resolveDns(host) {
  return new Promise((resolve) => {
    dns.resolve(host, (err, addresses) => {
      if (err) {
        console.error(`DNS resolve failed for ${host}:`, err.message);
        resolve(null);
      } else {
        console.log(`DNS resolve for ${host}:`, addresses);
        resolve(addresses);
      }
    });
  });
}

// 2. Test DB Connection
async function testDb(url, label) {
  console.log(`\nTesting DB Connection (${label})...`);
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const start = Date.now();
    await client.connect();
    console.log(`Successfully connected in ${Date.now() - start}ms!`);
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error(`Connection failed for ${label}:`, err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

// 3. Test Upstash Redis
async function testRedis() {
  console.log('\nTesting Upstash Redis...');
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const start = Date.now();
    const pingRes = await redis.ping();
    console.log(`Upstash Redis ping response: "${pingRes}" in ${Date.now() - start}ms`);
  } catch (err) {
    console.error('Upstash Redis connection failed:', err.message);
  }
}

async function run() {
  const dbHost = 'ep-billowing-poetry-airlyr7a-pooler.c-4.us-east-1.aws.neon.tech';
  const redisHost = 'winning-griffon-130443.upstash.io';
  
  await resolveDns(dbHost);
  await resolveDns(redisHost);

  if (dbUrlFull) {
    await testDb(dbUrlFull, 'With Channel Binding');
    await testDb(dbUrlNoChannelBinding, 'Without Channel Binding');
  }

  await testRedis();
  console.log('\n--- Diagnosis Complete ---');
}

run();
