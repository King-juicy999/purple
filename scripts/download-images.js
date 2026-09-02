import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'images');

// Image URLs and their filenames
const images = [
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQXrrpVLVCs2KD-jAoQfzqMhOhaJ1gMTBOhYJNHuyFnjie47He-TkG6Fjxh2XBWR3wYFHhyWKIzh1TyoONjwY7dFnCqLMcO-U7LyTK2NyoJsFadvPQMlKtysIDyGJbbCPstNyxUS1R24q-VFaeCtVIS3U69-rYGemU14YJ_vkf4-FcXLIpRPnjgQmpGOVfVqAaQiGDbqqgHIpLjBClBdfN4MLBk86IvrxJcw8HddyDM=w1280',
    filename: 'portfolio-1-hero-banner.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQUZ3LKnXU7rslqYbJwcdo-DSWqkhCEERNp0JC0imKQQyn6cLY3qLAZtFESssD9kX0d85sb7LNkYAWwcZNQ6T5wDazM5381sMmkBaj5oXsXo2n8S4kZjRHIEOYE6SYq8cOL2NunxqsGFp4xZByhXrrqDEk9qPItID-Zg1VJTBd92treVBq-kCI1bxZK2NES57agl1-yNS5cbjz9daA7AbeHivqdSb0zG_btdooZmsjc=w1280',
    filename: 'portfolio-2-staff-setup.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQXZz6EmpxZbKCqU46oXz1TUN-5ipsFwXwwJcgFH4djbBgWlzBipm55cP-Tp_T2O-di82BFczgG-Kv68G4eImsAv-scyJqVac9NKcj8fVkt6fqZdsj6_uKmMX8oZnOI08dc3-z6EKH7Pt135Nm2pZ7jPHAfX2MSe6rBSecq90RGiqtIjEx5uzWuxKDB3XghTjOKqNajHDeOxlTFHAz-TDUZNvHoYx_AGe2B7x1MlUIQ=w1280',
    filename: 'portfolio-3-client-collab.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQWpnyLqBRa2f2WclHWgAi3ZiE-V9cfxHAuVinwNuE2NPdi-0M4tqWXZEAggkg6kluce0UKYIx2bF7lcLzNZtYjAzSkYUJraTRIbHiwyopIG_Bm0dw5onvC80_o1stYzk2gQqd8vy-bv8FpwEEOrmuvq8koziTdKXuLuqhFCJzuUpATF7mujlpqaBLbwHA_BUYJo8JKeJM8fq1Pysr1MRzi2pgRoY6wZwS8WCTTRin0=w1280',
    filename: 'portfolio-4-radisson-blu.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQWGijg81W1LG_paW63WLog8I310rveyJnCkZFg1F3dC4YuS3WaM7GwRF9czay1QZZBLi2nSZqzfPpXyVZnknEvxyEPQ-x0tVAb_lpp-0R0KKTNOAwNbAw3XTwi7lfsXORNYD6jNgmsqnIBmqFyzhI0drnHxIroXcmxZp8aXM9OFEYYrlBjbnYNhyzBEwaUaqLqC_eZLTIEDdCZCOGCgeBWy9CDEroCfs66mzvZs=w1280',
    filename: 'portfolio-5-one-year.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQWy-cLX9sJXgAVE1DhsaRkDa2Mf8VQT5VHF4Td5H7hFxDNt0upvpI6pjDaqtQFRtnUPLb1ixBdH_r-9PHPMBDQDKfLuKJoZpuwD0qzQRzPFBprGzQ5Kr_hKb2_l5YBrPwC8Ij3FzOS2qfFKaxLGFubWQ8ZgzecaI6dgp4F3niAuhMXpIKuAK1KrVN4_4Ld5NuMcR0SEPrdHhXoQIeMzYAsfJZecmiIKDcmQWqO4IB8=w1280',
    filename: 'portfolio-6-50th-cherry-blossom.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/sitesv/AG8ngQW2evkMPtpkN27Eq3OK4qJkUIJ5B7pI_cM7mTpTNphUiAD6ZQPqmHk2N1xRt4TGH2YiJSweNLlf01pmN5QJMiPIc9DQCNBQFQl1FAP_IIHLTJW9ZbDvMuM509Js8_kr4BEPr4MqmIfdoQRWD6RSME9VQuyl4GlkHdGhXyU0BwqnGwkzU7NXeRKi-FcKfldvrj28AqvxCREqa748ujA28noIsxQKIXFRuwtPmzXxP1A=w1280',
    filename: 'portfolio-7-floral-photoshoot.jpg',
  },
];

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, { timeout: 30000 }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function downloadAllImages() {
  console.log('Downloading images...\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const results = [];

  for (const image of images) {
    const filepath = path.join(IMAGES_DIR, image.filename);

    if (fs.existsSync(filepath)) {
      console.log(`  ✓ ${image.filename} (already exists)`);
      results.push({ filename: image.filename, success: true, skipped: true });
      continue;
    }

    try {
      console.log(`  Downloading ${image.filename}...`);
      await downloadFile(image.url, filepath);
      console.log(`  ✓ ${image.filename} downloaded successfully`);
      results.push({ filename: image.filename, success: true });
    } catch (error) {
      console.error(`  ✗ Failed to download ${image.filename}: ${error.message}`);
      results.push({ filename: image.filename, success: false, error: error.message });
    }
  }

  console.log('\nSummary:');
  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`   Downloaded: ${successful}`);
  console.log(`   Skipped (existing): ${skipped}`);
  console.log(`   Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nSome images failed to download. The site will show broken images for those.');
  } else {
    console.log('\nAll images downloaded successfully!');
  }

  return results;
}

downloadAllImages().catch(console.error);