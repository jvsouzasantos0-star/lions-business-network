const sharp = require('../server/node_modules/sharp');
const path = require('path');
const fs = require('fs');

const INPUT = path.resolve(__dirname, '../public/img/hero-lion.png');
const RES_DIR = path.resolve(__dirname, '../android/app/src/main/res');

const sizes = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 }
];

(async () => {
  if (!fs.existsSync(INPUT)) {
    console.error('Source image not found:', INPUT);
    process.exit(1);
  }

  for (const { dir, size } of sizes) {
    const outDir = path.join(RES_DIR, dir);
    fs.mkdirSync(outDir, { recursive: true });

    const outFile = path.join(outDir, 'ic_launcher.png');
    const roundFile = path.join(outDir, 'ic_launcher_round.png');
    const fgFile = path.join(outDir, 'ic_launcher_foreground.png');

    const resized = await sharp(INPUT)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer();

    fs.writeFileSync(outFile, resized);
    fs.writeFileSync(roundFile, resized);

    const fgSize = Math.round(size * 1.5);
    const fgResized = await sharp(INPUT)
      .resize(fgSize, fgSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.floor((fgSize - size) / 2),
        bottom: Math.ceil((fgSize - size) / 2),
        left: Math.floor((fgSize - size) / 2),
        right: Math.ceil((fgSize - size) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(fgSize, fgSize)
      .png()
      .toBuffer();

    fs.writeFileSync(fgFile, fgResized);

    console.log(`  ${dir}: ic_launcher.png (${size}x${size}), ic_launcher_round.png, ic_launcher_foreground.png`);
  }

  console.log('\nAll icon sizes generated successfully.');
})().catch((err) => {
  console.error('Error generating icons:', err.message);
  process.exit(1);
});
