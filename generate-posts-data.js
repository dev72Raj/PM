const fs = require('fs');
const path = require('path');

const postsDir = './posts';
const outputFile = './posts-data.json';

if (!fs.existsSync(postsDir)) {
  fs.writeFileSync(outputFile, '[]');
  console.log('No posts directory found. Generated empty posts-data.json');
  process.exit(0);
}

const files = fs.readdirSync(postsDir).filter(function(f) { return f.endsWith('.md'); });
const posts = [];

files.forEach(function(file) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return;

  const fm = {};
  match[1].split('\n').forEach(function(line) {
    const colon = line.indexOf(':');
    if (colon > -1) {
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim().replace(/^"|"$/g, '');
      fm[key] = val;
    }
  });

  const slug = fm.slug || file.replace('.md', '');
  posts.push({
    slug: slug,
    title: fm.title || '',
    date: fm.date || '',
    image: fm.image || '',
    body: match[2].trim()
  });
});

posts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log('Generated ' + posts.length + ' posts to ' + outputFile);
