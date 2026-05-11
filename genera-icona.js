const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generaIcona(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background scuro
  ctx.fillStyle = '#080b12';
  ctx.fillRect(0, 0, size, size);

  // Cerchio esterno sottile dorato
  const centro = size / 2;
  const raggioEsterno = size * 0.42;
  ctx.beginPath();
  ctx.arc(centro, centro, raggioEsterno, 0, Math.PI * 2);
  ctx.strokeStyle = '#d4a853';
  ctx.lineWidth = size * 0.025;
  ctx.stroke();

  // Arco verde progresso (3/4 del cerchio)
  const raggioArco = size * 0.42;
  ctx.beginPath();
  ctx.arc(centro, centro, raggioArco, -Math.PI / 2, Math.PI, false);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = size * 0.035;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Lettera A grande al centro
  const fontSizeA = size * 0.38;
  ctx.font = `700 ${fontSizeA}px serif`;
  ctx.fillStyle = '#d4a853';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', centro, centro - size * 0.04);

  // Piccola Q sotto
  const fontSizeQ = size * 0.14;
  ctx.font = `400 ${fontSizeQ}px serif`;
  ctx.fillStyle = '#10b981';
  ctx.fillText('ancora qui', centro, centro + size * 0.28);

  // Salva
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✓ Generata: ${filename} (${size}x${size})`);
}

// Genera tutte le dimensioni necessarie
const outputDir = './assets/images';

generaIcona(1024, path.join(outputDir, 'icon.png'));
generaIcona(1024, path.join(outputDir, 'splash-icon.png'));
generaIcona(1024, path.join(outputDir, 'adaptive-icon.png'));

console.log('\n✅ Tutte le icone generate!');
console.log('Ora aggiorna app.json con adaptive-icon foregroundImage: ./assets/images/adaptive-icon.png');