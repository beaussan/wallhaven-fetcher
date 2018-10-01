#!/usr/bin/env node

const program = require('commander');
const Wallhaven = require('wallhaven-api');
const fs = require('fs');
const https = require('https');
const Stream = require('stream').Transform;

const api = new Wallhaven();

async function searchAndSave(
  keywords,
  { random = false, nsfw = false, sketchy = false, hasFilename = false, catherogy = [] },
) {
  const data = await api.search(keywords.join(' '), {
    nsfw,
    sketchy,
    sorting: random ? 'random' : 'relevance',
    categories: catherogy,
  });
  const firstImage = data.images[0];
  const firstImgData = await api.details(firstImage.id);

  console.log(firstImgData.fullImage);

  https
    .request(firstImgData.fullImage, function(response) {
      var data = new Stream();

      response.on('data', function(chunk) {
        data.push(chunk);
      });

      response.on('end', function() {
        let file = '';
        if (hasFilename) {
          file = hasFilename;
        } else {
          file = `wallhaven-${firstImage.id}.jpg`;
        }
        fs.writeFileSync(file, data.read());
      });
    })
    .end();
}

program
  .usage('<terms ...>')
  .option('-r, --random', 'Pick one randomly')
  .option('-N, --nsfw', 'Enable the nsfw filter')
  .option('-S, --sketchy', 'Enable the sketchy filter')
  .option('--no-general', 'Remove general category')
  .option('--no-anime', 'Remove anime category')
  .option('--no-people', 'Remove people category')
  .option('-o, --output [file]', 'The path to save the file');

program.parse(process.argv);

const catherogy = [];
if (program.general) {
  catherogy.push('general');
}
if (program.anime) {
  catherogy.push('anime');
}
if (program.people) {
  catherogy.push('people');
}

searchAndSave(program.args, {
  random: !!program.random,
  sketchy: !!program.sketchy,
  nsfw: !!program.nsfw,
  hasFilename: program.output,
  catherogy,
});
