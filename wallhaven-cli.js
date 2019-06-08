#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
const progress = require('stream-progressbar');

function boolanToNumber(value) {
  return value ? '1' : '0';
}

function categoryToNumber(category = { general: false, anime: false, people: false }) {
  return `${boolanToNumber(category.general)}${boolanToNumber(
    category.anime,
  )}${boolanToNumber(category.people)}`;
}

async function downloadImage(url, filename) {
  const writer = fs.createWriteStream(filename);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data
    .pipe(progress(':bar'))
    .pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function search({ random = false, sketchy = false, search = '', category }) {
  const params = querystring.stringify({
    q: `${search}`,
    sorting: random ? 'random': 'relevance',
    categories: categoryToNumber(category),
    purity: `1${boolanToNumber(sketchy)}0`,
    atleast: '1920x1080',
    ratios: '16x9'
  });
  const { data } = await axios.get(
    `https://wallhaven.cc/api/v1/search?${params}`,
  );
  return data.data;
}

async function searchAndSave(
  keywords,
  { random = false, sketchy = false, hasFilename = false, category = [] },
) {
  const data = await search({
    sketchy,
    random,
    category,
    search: keywords.join(' '),
  });
  // const selector = random ? Math.floor(Math.random() * data.length) : 0;
  const firstImage = data[0];

  await downloadImage(
    firstImage.path,
    hasFilename ? hasFilename : `wallhaven-${firstImage.id}.jpg`,
  );
}

program
  .usage('<terms ...>')
  .option('-r, --random', 'Pick one randomly')
  .option('-S, --sketchy', 'Enable the sketchy filter')
  .option('--no-general', 'Remove general category')
  .option('--no-anime', 'Remove anime category')
  .option('--no-people', 'Remove people category')
  .option('-o, --output [file]', 'The path to save the file');

program.parse(process.argv);

const category = {
  general: !!program.general,
  anime: !!program.anime,
  people: !!program.people,
};

searchAndSave(program.args, {
  random: !!program.random,
  sketchy: !!program.sketchy,
  hasFilename: program.output,
  category,
});
