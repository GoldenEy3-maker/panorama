import sharp from "sharp";
import {
  readdir,
  mkdir,
  readFile,
  rm,
  writeFile,
  unlink,
} from "node:fs/promises";

function extractBasename(file) {
  const extIdx = file.lastIndexOf(".");
  return file.slice(0, extIdx);
}

async function ensureDirectoryExistence(filePath) {
  await mkdir(filePath, { recursive: true });
}

async function formatTilesDir(tilesPath, basename) {
  const tiles = await readdir(`${tilesPath}/${basename}_files/13`);

  const tilesMap = await tiles.reduce(async (prev, tile) => {
    const acc = await prev;
    acc[basename + "_" + tile] = await readFile(
      `${tilesPath}/${basename}_files/13/${tile}`
    );

    return acc;
  }, Promise.resolve({}));

  await rm(`${tilesPath}/${basename}_files`, {
    force: true,
    recursive: true,
  });
  await unlink(`${tilesPath}/${basename}.dzi`);

  // const reduntFiles = await readdir(tilesPath);

  // reduntFiles.forEach(
  //   async (file) =>
  //     await rm(`${tilesPath}/${file}`, { force: true, recursive: true })
  // );

  for (const [key, value] of Object.entries(tilesMap)) {
    await writeFile(`${tilesPath}/${key}`, value);
  }
}

async function main() {
  const towers = await readdir("assets/orig");

  if (towers.length)
    towers.forEach(async (towerIndex) => {
      const floors = await readdir(`assets/orig/${towerIndex}`);

      if (floors.length)
        floors.forEach(async (floorIndex) => {
          const origImages = await readdir(
            `assets/orig/${towerIndex}/${floorIndex}`
          );

          if (origImages.length)
            origImages.forEach(async (image) => {
              const basename = extractBasename(image);

              await ensureDirectoryExistence(
                `assets/low/${towerIndex}/${floorIndex}`
              );

              await sharp(`assets/orig/${towerIndex}/${floorIndex}/${image}`)
                .resize({ width: 2048, height: 1024 })
                .webp({ quality: 40 })
                .toFile(
                  `assets/low/${towerIndex}/${floorIndex}/${basename}.webp`
                );

              await ensureDirectoryExistence(
                `assets/tiles/${towerIndex}/${floorIndex}`
              );

              await sharp(`assets/orig/${towerIndex}/${floorIndex}/${image}`)
                .webp({ quality: 90 })
                .tile({
                  size: 512,
                })
                .toFile(
                  `assets/tiles/${towerIndex}/${floorIndex}/${basename}.dz`
                );

              await formatTilesDir(
                `assets/tiles/${towerIndex}/${floorIndex}`,
                basename
              );
            });
        });
    });
}

main();
