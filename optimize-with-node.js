const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function optimizeOnServer() {
  console.log('Оптимизация изображений на сервере...\n');
  
  const script = `
cd /var/www/popugai-market
npm install sharp --no-save
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = './public/images/products';
const files = fs.readdirSync(dir).filter(f => f.match(/product-.*\\.jpg$/));

console.log('Найдено файлов:', files.length);

(async () => {
  for (const file of files) {
    const filePath = path.join(dir, file);
    const tempPath = path.join(dir, 'temp_' + file);
    
    try {
      const stats = fs.statSync(filePath);
      const sizeBefore = (stats.size / 1024).toFixed(2);
      
      await sharp(filePath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toFile(tempPath);
      
      fs.renameSync(tempPath, filePath);
      
      const statsAfter = fs.statSync(filePath);
      const sizeAfter = (statsAfter.size / 1024).toFixed(2);
      const saved = ((1 - statsAfter.size / stats.size) * 100).toFixed(1);
      
      console.log(file + ': ' + sizeBefore + ' KB -> ' + sizeAfter + ' KB (' + saved + '% экономия)');
    } catch (err) {
      console.error('Ошибка ' + file + ':', err.message);
    }
  }
  console.log('\\nГотово!');
})();
"
`;

  try {
    const { stdout, stderr } = await execAsync(`ssh root@144.31.212.184 "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

optimizeOnServer();
