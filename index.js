const bodyParser = require('body-parser');
const Confirm = require('prompt-confirm');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const glob = require('glob');

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
      output += `  ${component}: ${JSON.stringify(changes[id][component])}`;
    });
    output += '\n';
  });
  return output;
}

function sync (changes) {
  files.forEach(file => {
    const contents = updateFile(fs.readFileSync(file, 'utf-8'), changes);
    fs.writeFileSync(file, contents);
  });
  console.log('Sync complete.');
}

/**
 * Given changes, scan for IDs, and write to HTML file.
 */
function updateFile (content, changes) {
  Object.keys(changes).forEach(id => {
    // Scan for ID in file.
    const regex = new RegExp(`<a-entity.*?id=".*?${id}.*?".*?</a-entity>`);
    const match = regex.exec(content);
    if (!match) { return; }

    const entityMatchIndex = match.index;
    const originalEntityString = match[0];
    let entityString = match[0];

    // Scan for components within entity.
    Object.keys(changes[id]).forEach(attribute => {
      // Check if component is defined already.
      const attributeRegex = new RegExp(`${attribute}="(.*?)"`);
      const attributeMatch = attributeRegex.exec(entityString);
      const value = changes[id][attribute];

      if (attribute.indexOf('.') === -1) {
        // Single-property attribute match (e.g., position, rotation, scale).
        if (attributeMatch) {
          // Modify.
          entityString = entityString.replace(
            new RegExp(`${attribute}="(.*)"`),
            `${attribute}="${value}"`
          );
        } else {
          // Add.
          entityString = entityString.replace(
            new RegExp(`id="${id}"`),
            `id="${id}" ${attribute}="${value}"`
          );
        }
      } else {
        // Multi-property attribute match (e.g., material).
        if (attributeMatch) {
          // TODO: Modify.
        } else {
          // TODO: Add.
        }
      }
    });

    // Splice in updated entity string into file content.
    content = content.substring(0, entityMatchIndex) +
              entityString +
              content.substring(entityMatchIndex + originalEntityString.length,
                                content.length);
  });

  return content;
}

/**
 * What files to edit, can be passed in as glob string.
 */
function getWorkingFiles () {
  let globString = '';
  process.argv.forEach(function (val, index, array) {
    if (index < 2) { return; }
    if (!globString) {
      globString += `{${val}`;
    } else {
      globString += `${val}`;
    }

    if (index !== process.argv.length - 1) { globString += ','; }
  });
  if (globString) { globString += '}'; }

  console.log(globString);
  return glob.sync(globString || '**/*.html');
}

const PORT = process.env.PORT || 51234;
app.listen(PORT, () => {
  console.log(`Watching for messages from Inspector on localhost:${PORT}.`);
});

const files = getWorkingFiles();
console.log('Found HTML files:', files);
