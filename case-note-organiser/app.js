const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// File to store case notes
const DATA_FILE = 'cases.json';

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Read all cases from file
function readCases() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Write cases to file
function writeCases(cases) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cases, null, 2));
}

// Add a new case note
app.post('/api/cases', (req, res) => {
    const { caseReference, memberName, note } = req.body;
    
    if (!caseReference || !memberName || !note) {
        return res.status(400).json({ 
            error: 'Case reference, member name, and note are required' 
        });
    }
    
    const newCase = {
        id: uuidv4(),
        caseReference,
        memberName,
        note,
        createdAt: new Date().toISOString()
    };
    
    const cases = readCases();
    cases.push(newCase);
    writeCases(cases);
    
    res.status(201).json(newCase);
});

// Get all cases
app.get('/api/cases', (req, res) => {
    const cases = readCases();
    res.json(cases);
});

// Search cases by case reference or member name
app.get('/api/cases/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const cases = readCases();
    
    const filteredCases = cases.filter(caseItem => 
        caseItem.caseReference.toLowerCase().includes(query) ||
        caseItem.memberName.toLowerCase().includes(query)
    );
    
    res.json(filteredCases);
});

// Get a specific case by ID
app.get('/api/cases/:id', (req, res) => {
    const cases = readCases();
    const caseItem = cases.find(c => c.id === req.params.id);
    
    if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(caseItem);
});

// Update a case
app.put('/api/cases/:id', (req, res) => {
    const { caseReference, memberName, note } = req.body;
    const cases = readCases();
    
    const caseIndex = cases.findIndex(c => c.id === req.params.id);
    
    if (caseIndex === -1) {
        return res.status(404).json({ error: 'Case not found' });
    }
    
    if (!caseReference || !memberName || !note) {
        return res.status(400).json({ 
            error: 'Case reference, member name, and note are required' 
        });
    }
    
    cases[caseIndex] = {
        ...cases[caseIndex],
        caseReference,
        memberName,
        note
    };
    
    writeCases(cases);
    res.json(cases[caseIndex]);
});

// Delete a case
app.delete('/api/cases/:id', (req, res) => {
    const cases = readCases();
    const caseIndex = cases.findIndex(c => c.id === req.params.id);
    
    if (caseIndex === -1) {
        return res.status(404).json({ error: 'Case not found' });
    }
    
    cases.splice(caseIndex, 1);
    writeCases(cases);
    
    res.json({ message: 'Case deleted successfully' });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Case Note Organiser is running on http://localhost:${PORT}`);
});