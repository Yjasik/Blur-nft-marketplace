const fs = require('fs');
const { createCanvas } = require('canvas');

const colors = ['#ff8700', '#ff6a00', '#ff5500', '#ff4400', '#ff3300'];
const totalNFTs = 100; // Создаем 100 NFT для примера

// Создаем папку для изображений
if (!fs.existsSync('./nft-images')) {
  fs.mkdirSync('./nft-images');
}

for (let i = 1; i <= totalNFTs; i++) {
  // Создаем холст 500x500px
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');
  
  // Фон с градиентом
  const gradient = ctx.createLinearGradient(0, 0, 500, 500);
  gradient.addColorStop(0, colors[i % colors.length]);
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 500, 500);
  
  // Текст "YJS Master"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Arial"';
  ctx.textAlign = 'center';
  ctx.fillText(`YJS Master #${i}`, 250, 250);
  
  // Рамка
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, 480, 480);
  
  // Сохраняем изображение
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./nft-images/${i}.png`, buffer);
  
  console.log(`Created image ${i}.png`);
}

console.log('All images created!');