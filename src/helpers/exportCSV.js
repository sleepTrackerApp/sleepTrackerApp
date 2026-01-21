/**
 * Parse database data into CSV format.
 */


function csvExport(entries){
    if (!entries) {return 'No Data'};
    
    const headers = Object.keys(entries[0]).join(',');

    const rows = entries.map(entry => {
        return Object.values(entry)
            .map(value => {
                if (value == null) return '';
                return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',');
    });

return [headers, ...rows].join('\n');

}


module.exports = {
    csvExport,
};
