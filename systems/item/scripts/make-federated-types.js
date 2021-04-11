#!/usr/bin/env node

// https://github.com/pixability/federated-types

const path = require('path');
const fs = require('fs');
const ts = require('typescript');

const outputDir = path.resolve(__dirname, '../../../node_modules/@types/__federated_types/');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const findFederationConfigs = (base, files, result) => {
  files = files || fs.readdirSync(base);
  result = result || [];

  files.forEach((file) => {
    const newBase = path.join(base, file);
    if (fs.statSync(newBase).isDirectory()) {
      result = findFederationConfigs(newBase, fs.readdirSync(newBase), result);
    } else {
      if (file === 'federation.config.json') {
        result.push(require(path.resolve('./', newBase)));
      }
    }
  });

  return result;
};

const configs = findFederationConfigs('./');

if (configs.length !== 1) {
  console.error(`ERROR: Found ${configs.length} federation configs`);
  process.exit(1);
}

const federationConfig = configs[0];
const compileFiles = Object.values(federationConfig.exposes).map((file) => path.resolve(__dirname, `../${file}`));
const componentNames = Object.keys(federationConfig.exposes).map((name) => name.replace('./', ''));
const outFile = path.resolve(outputDir, `${federationConfig.name}.d.ts`);

try {
  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }

  // write the typings file
  const program = ts.createProgram(
    compileFiles.map((filePath) => (fs.lstatSync(filePath).isDirectory() ? `${filePath}/index.tsx` : filePath)),
    {
      outFile,
      declaration: true,
      emitDeclarationOnly: true,
      skipLibCheck: true,
      jsx: 'preserve',
      esModuleInterop: true,
    },
  );

  program.emit();

  let typing = fs.readFileSync(outFile, { encoding: 'utf8', flag: 'r' });

  const moduleRegex = RegExp(/declare module "(.*)"/, 'g');
  const moduleNames = [];

  while ((execResults = moduleRegex.exec(typing)) !== null) {
    moduleNames.push(execResults[1]);
  }

  moduleNames.forEach((name, index) => {
    const regex = RegExp(`"${name}`, 'g');
    const split = compileFiles[index].split('/');
    typing = typing.replace(regex, `"${federationConfig.name}/${componentNames[index]}`);
  });

  console.log('writing typing file:', outFile);

  fs.writeFileSync(outFile, typing);

  // if we are writing to the node_modules/@types directory, add a package.json file
  if (outputDir.includes('node_modules/@types')) {
    const packageJsonPath = path.resolve(outputDir, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.log('writing package.json:', packageJsonPath);
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: '@types/__federated_types',
          version: '0.0.1',
          description: 'Placholder for federated typings',
          license: 'MIT',
          main: '',
          types: 'index.d.ts',
        }),
      );
    } else {
      console.log(packageJsonPath, 'already exists');
    }
  } else {
    console.log('not writing to node modules, dont need a package.json');
  }

  // write/update the index.d.ts file
  const indexPath = path.resolve(outputDir, 'index.d.ts');
  const importStatement = `export * from './${federationConfig.name}';`;

  if (!fs.existsSync(indexPath)) {
    console.log('creating index.d.ts file');
    fs.writeFileSync(indexPath, `${importStatement}\n`);
  } else {
    console.log('updating index.d.ts file');
    const contents = fs.readFileSync(indexPath);
    if (!contents.includes(importStatement)) {
      fs.writeFileSync(indexPath, `${contents}${importStatement}\n`);
    }
  }

  console.log('Success!');
} catch (e) {
  console.error(e);
  process.exit(1);
}
