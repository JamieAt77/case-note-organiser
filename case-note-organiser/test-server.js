const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3011;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// File to store case notes
const DATA_FILE = 'test-cases.json';

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

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main page
app.get('/', (req, res) => {
    res.send('<h1>Case Note Organiser API</h1><p>Server is running and accessible</p>');
});

console.log(`Test server starting on port ${PORT}`);
const server = app.listen(PORT, () => {
    console.log(`Test Case Note Organiser is running on http://localhost:${PORT}`);
    
    // For testing purposes, exit after a short time
    setTimeout(() => {
        console.log('Test server shutting down');
        server.close();
        process.exit(0);
    }, 3000);
});