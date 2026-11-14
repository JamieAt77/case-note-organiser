const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database file
const dbPath = 'db.json';

// Helper function to read database
function readDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
    return { cases: [] };
  } catch (error) {
    console.error('Error reading database:', error);
    return { cases: [] };
  }
}

// Helper function to write database
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// API Routes

// Add a new case note
app.post('/api/cases', (req, res) => {
  try {
    const { caseReference, memberName, note } = req.body;
    
    // Validate input
    if (!caseReference || !memberName || !note) {
      return res.status(400).json({ 
        error: 'Case reference, member name and note are required' 
      });
    }
    
    const db = readDB();
    
    const newCase = {
      id: Date.now().toString(),
      caseReference,
      memberName,
      note,
      createdAt: new Date().toISOString()
    };
    
    db.cases.push(newCase);
    writeDB(db);
    
    res.json(newCase);
  } catch (error) {
    console.error('Error adding case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all cases
app.get('/api/cases', (req, res) => {
  try {
    const db = readDB();
    res.json(db.cases);
  } catch (error) {
    console.error('Error getting cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search cases by case reference or member name
app.get('/api/cases/search/:query', (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const db = readDB();
    
    const cases = db.cases.filter(caseItem => 
      caseItem.caseReference.toLowerCase().includes(query) ||
      caseItem.memberName.toLowerCase().includes(query)
    );
    
    res.json(cases);
  } catch (error) {
    console.error('Error searching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific case by ID
app.get('/api/cases/:id', (req, res) => {
  try {
    const db = readDB();
    const caseItem = db.cases.find(caseItem => caseItem.id === req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(caseItem);
  } catch (error) {
    console.error('Error getting case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a case
app.put('/api/cases/:id', (req, res) => {
  try {
    const { caseReference, memberName, note } = req.body;
    
    if (!caseReference || !memberName || !note) {
      return res.status(400).json({ 
        error: 'Case reference, member name and note are required' 
      });
    }
    
    const db = readDB();
    const index = db.cases.findIndex(caseItem => caseItem.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    db.cases[index] = {
      ...db.cases[index],
      caseReference,
      memberName,
      note,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(db);
    res.json(db.cases[index]);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a case
app.delete('/api/cases/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.cases.findIndex(caseItem => caseItem.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    db.cases.splice(index, 1);
    writeDB(db);
    
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start server
app.listen(port, () => {
  console.log(`Case note organiser listening at http://localhost:${port}`);
});

module.exports = app;