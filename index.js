#!/usr/bin/env node
const bodyParser = require('body-parser');
const Confirm = require('prompt-confirm');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const glob = require('glob');

let files;

const app = express()
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/save', (req, res) => {
  const changes = req.body;

  // Prompt to confirm.
  console.log([
    `\nA-Frame Inspector from ${req.hostname} has requested the following changes:\n`,
    `${prettyPrintChanges(changes)}`,
    'Do you allow the A-Frame Inspector Watcher to write these updates directly ' +
    'within this directory?'
  ].join('\n'));

  const prompt = new Confirm('Y/n');
  prompt.run().then(answer => {
    // Denied.
    if (!answer) { res.sendStatus(403); }

    // Accepted.
    sync(changes);
    res.sendStatus(200);
  });
});

function prettyPrintChanges (changes) {
  let output = '';
  Object.keys(changes).forEach(id => {
    output += `#${id}:\n`;
    Object.keys(changes[id]).forEach(component => {
      if (typeof changes[id][component] === 'object') {
        output += `  ${component}:\n`;
        Object.keys(changes[id][component]).forEach(property => {
          output += `    ${property}: ${changes[id][component][property]}\n`;
        });
      } else {
        output += `  ${component}: ${JSON.stringify(changes[id][component])}\n`;
      }
    });
    output += '\n';
  });
  return output;
}

function sync (changes) {
  files.forEach(file => {
    const contents = updateFile(file, fs.readFileSync(file, 'utf-8'), changes);
    fs.writeFileSync(file, contents);
  });
  console.log('Sync complete.');
}

/**
 * Given changes, scan for IDs, and write to HTML file.
 */
function updateFile (file, content, changes) {
  // Matches any character including line breaks.
  const element = '(<a-[\\w]+)';
  const filler = '([^]*?)';
  const whitespace = '[\\s\\n]';
  const propertyDelimit = '["\\s;\]';

  Object.keys(changes).forEach(id => {
    // Scan for ID in file.
    const regex = new RegExp(`${element}${filler}(${whitespace})id="${id}"${filler}>`);
    const match = regex.exec(content);
    if (!match) { return; }

    // Might match unwanted parent entities, filter out.
    const entitySplit = match[0].split('<a-');
    let entityString = '<a-' + entitySplit[entitySplit.length - 1];
    const originalEntityString = entityString;

    // Post-process regex to get only last occurence.
    const idWhitespaceMatch = match[3];

    // Scan for components within entity.
    Object.keys(changes[id]).forEach(attribute => {
      // Check if component is defined already.
      const attributeRegex = new RegExp(`(${whitespace})${attribute}="(.*?)(;?)"`);
      const attributeMatch = attributeRegex.exec(entityString);
      const value = changes[id][attribute];

      if (typeof value === 'string') {
        // Single-property attribute match (e.g., position, rotation, scale).
        if (attributeMatch) {
          const whitespaceMatch = attributeMatch[1];
          // Modify.
          entityString = entityString.replace(
            new RegExp(`${whitespaceMatch}${attribute}=".*?"`),
            `${whitespaceMatch}${attribute}="${value}"`
          );
        } else {
          // Add.
          entityString = entityString.replace(
            new RegExp(`${idWhitespaceMatch}id="${id}"`),
            `${idWhitespaceMatch}id="${id}" ${attribute}="${value}"`
          );
        }
      } else {
        // Multi-property attribute match (e.g., material).
        Object.keys(value).forEach(property => {
          const attributeMatch = attributeRegex.exec(entityString);
          const propertyValue = value[property];

          if (attributeMatch) {
            // Modify attribute.
            let attributeString = attributeMatch[0];
            const whitespaceMatch = attributeMatch[1];
            const propertyRegex = new RegExp(`(${propertyDelimit})${property}:(.*?)([";])`);
            propertyMatch = propertyRegex.exec(attributeMatch);

            if (propertyMatch) {
              // Modify property.
              const propertyDelimitMatch = propertyMatch[1];
              attributeString = attributeString.replace(
                new RegExp(`${propertyDelimitMatch}${property}:(.*?)([";])`),
                `${propertyDelimitMatch}${property}: ${propertyValue}${propertyMatch[3]}`
              );
            } else {
              // Add property to existing.
              attributeString = attributeString.replace(
                new RegExp(`${whitespaceMatch}${attribute}="(.*?)(;?)"`),
                `${whitespaceMatch}${attribute}="${attributeMatch[2]}${attributeMatch[3]}; ${property}: ${propertyValue}"`
              );
            }

            // Update entity string with updated component.
            entityString = entityString.replace(attributeMatch[0], attributeString);
          } else {
            // Add component entirely.
            entityString = entityString.replace(
              new RegExp(`${idWhitespaceMatch}id="${id}"`),
              `${idWhitespaceMatch}id="${id}" ${attribute}="${property}: ${propertyValue}"`
            );
          }
        });
      }

      console.log(`Updated ${attribute} of #${id} in ${file}.`);
    });

    // Splice in updated entity string into file content.
    content = content.replace(originalEntityString, entityString);
  });

  return content;
}
module.exports.updateFile = updateFile;

/**
 * What files to edit, can be passed in as glob string.
 */
function getWorkingFiles () {
  let files = [];

  if (process.argv.length <= 2) {
    return glob.sync('**/*.html');
  }

  process.argv.forEach(function (val, index, array) {
    if (index < 2) { return; }

    if (fs.lstatSync(val).isDirectory()) {
      if (!val.endsWith('/')) { val += '/'; }
      val += '**/*.html';
    }

    files = files.concat(glob.sync(val));
  });

  return files;
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 51234;
  app.listen(PORT, () => {
    console.log(`Watching for messages from Inspector on localhost:${PORT}.`);
  });

  files = getWorkingFiles();
  console.log('Found HTML files:', files);
  if (!files.length) {
    throw new Error(
      'No HTML files found. ' +
      'Try passing a directory or wildcard pointing to HTML files (e.g., **/*.html).');
  }
}
