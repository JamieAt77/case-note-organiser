// DOM Elements
const caseForm = document.getElementById('caseForm');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearch = document.getElementById('clearSearch');
const casesList = document.getElementById('casesList');

// Load all cases when page loads
document.addEventListener('DOMContentLoaded', loadCases);

// Form submission
caseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const caseReference = document.getElementById('caseReference').value;
    const memberName = document.getElementById('memberName').value;
    const note = document.getElementById('note').value;
    
    try {
        const response = await fetch('/api/cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caseReference,
                memberName,
                note
            })
        });
        
        if (response.ok) {
            // Reset form
            caseForm.reset();
            
            // Reload cases
            loadCases();
            
            console.log('Case added successfully');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding case:', error);
        alert('Error adding case. Please try again.');
    }
});

// Search functionality
searchButton.addEventListener('click', loadSearchResults);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        loadSearchResults();
    }
});

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    loadCases();
});

// Load all cases
async function loadCases() {
    try {
        const response = await fetch('/api/cases');
        const cases = await response.json();
        displayCases(cases);
    } catch (error) {
        console.error('Error loading cases:', error);
        casesList.innerHTML = '<p>Error loading cases. Please try again.</p>';
    }
}

// Load search results
async function loadSearchResults() {
    const query = searchInput.value.trim();
    
    if (query === '') {
        loadCases();
        return;
    }
    
    try {
        const response = await fetch(`/api/cases/search/${encodeURIComponent(query)}`);
        const cases = await response.json();
        displayCases(cases);
    } catch (error) {
        console.error('Error searching cases:', error);
        casesList.innerHTML = '<p>Error searching cases. Please try again.</p>';
    }
}

// Display cases in the UI
function displayCases(cases) {
    if (cases.length === 0) {
        casesList.innerHTML = '<p class="no-results">No cases found</p>';
        return;
    }
    
    casesList.innerHTML = cases.map(caseItem => `
        <div class="case-card">
            <h3>Case Reference</h3>
            <p class="case-reference">${escapeHtml(caseItem.caseReference)}</p>
            
            <h3>Member Name</h3>
            <p class="member-name">${escapeHtml(caseItem.memberName)}</p>
            
            <h3>Note</h3>
            <p class="note">${escapeHtml(caseItem.note)}</p>
            
            <p class="created-at">Created: ${new Date(caseItem.createdAt).toLocaleString()}</p>
        </div>
    `).join('');
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}