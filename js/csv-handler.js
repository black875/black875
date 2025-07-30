export class CSVHandler {
    static exportToCsv(people) {
        if (people.length === 0) {
            alert('No data to export.');
            return;
        }
        
        const dataToExport = people.map(p => ({
            name: p.name || '',
            position: p.position || '',
            employeeId: p.employeeId || '',
            password: p.password || '',
            // layouts: JSON.stringify(p.layouts)
        }));
        
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'badge_data.csv';
        link.click();
    }

    static importFromCsv(file, onImportComplete) {
        if (!file) return;
        
        if (!confirm('This will overwrite the current list. Continue?')) {
            document.getElementById('importCsvInput').value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                        alert('Error parsing CSV file.');
                        return;
                    }
                    
                    try {
                        let currentId = 1;
                        const importedPeople = results.data.map(row => {
                            if (!row.name && !row.position) return null;
                            return {
                                ...row,
                                id: currentId++,
                                // layouts: JSON.parse(row.layouts)
                            };
                        }).filter(Boolean);
                        
                        onImportComplete(importedPeople, currentId);
                        alert(`Successfully imported ${importedPeople.length} people.`);
                    } catch (err) {
                        alert('Invalid CSV format or corrupted data.');
                    }
                }
            });
        };
        reader.readAsText(file, 'Shift_JIS');
        document.getElementById('importCsvInput').value = '';
    }
} 