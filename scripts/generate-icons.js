import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const sourceLogo = path.resolve('/app/applet/public/assets/aistudio/exodo-appIcon_cbe32977.png');
  
  if (!fs.existsSync(sourceLogo)) {
    console.error('Source logo does not exist at:', sourceLogo);
    return;
  }

  console.log('Generating PWA icons with solid #000000 background...');

  // 1. Regular 512x512 icon (Solid black background, logo centered at 420x420)
  const logo512 = await sharp(sourceLogo)
    .resize(420, 420, { fit: 'contain' })
    .toBuffer();

  const icon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: logo512, gravity: 'center' }])
    .png()
    .toBuffer();

  fs.writeFileSync('/app/applet/public/pwa-512x512.png', icon512);
  fs.writeFileSync('/app/applet/public/assets/aistudio/exodo-appIcon_cbe32977.png', icon512);
  console.log('✓ Created public/pwa-512x512.png & updated exodo-appIcon_cbe32977.png');

  // 2. Maskable 512x512 icon (Solid black background, logo centered at 320x320 for 65% safe zone)
  // According to PWA standards, maskable icons need 15-20% margin on all sides so Android round/squircle cuts do not clip the logo.
  const logoMaskable = await sharp(sourceLogo)
    .resize(320, 320, { fit: 'contain' })
    .toBuffer();

  const iconMaskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: logoMaskable, gravity: 'center' }])
    .png()
    .toBuffer();

  fs.writeFileSync('/app/applet/public/pwa-maskable-512x512.png', iconMaskable);
  console.log('✓ Created public/pwa-maskable-512x512.png (maskable safe area)');

  // 3. 192x192 icon (Solid black background, logo centered at 156x156)
  const logo192 = await sharp(sourceLogo)
    .resize(156, 156, { fit: 'contain' })
    .toBuffer();

  const icon192 = await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: logo192, gravity: 'center' }])
    .png()
    .toBuffer();

  fs.writeFileSync('/app/applet/public/pwa-192x192.png', icon192);
  console.log('✓ Created public/pwa-192x192.png');

  // 4. Apple Touch Icon 180x180 (Solid black background, logo centered at 144x144)
  const logoApple = await sharp(sourceLogo)
    .resize(144, 144, { fit: 'contain' })
    .toBuffer();

  const iconApple = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: logoApple, gravity: 'center' }])
    .png()
    .toBuffer();

  fs.writeFileSync('/app/applet/public/apple-touch-icon.png', iconApple);
  console.log('✓ Created public/apple-touch-icon.png');

  console.log('All PWA icons successfully regenerated with solid black background!');
}

generateIcons().catch(console.error);
