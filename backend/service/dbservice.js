import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultTopics } from '../../user/src/data/mockTopics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory & JSON file path
const dataDir = path.join(__dirname, '../data');
const dbFilePath = path.join(dataDir, 'pioneer-db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let initialData = {
  categories: defaultTopics,
  courses: [],
  users: []
};

if (fs.existsSync(dbFilePath)) {
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    initialData = JSON.parse(raw);
    if (!initialData.categories || initialData.categories.length === 0) {
      initialData.categories = defaultTopics;
      fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('⚠️ Could not parse pioneer-db.json, using seed topics:', err.message);
  }
} else {
  // First run: save seed topics directly to disk
  fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
}

export const db = initialData;

// Helper to save database to disk
export const saveDb = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save database to disk:', err.message);
  }
};
