import { Parser } from "@json2csv/plainjs";

function exportCSV(entry) {
   if(!Array.isArray(entry) || entry.length == 0) {
       return "NULL Entries";
   } 

    const export = new Parser({
        quote: '"',
        delimter: ',',
        widthBOM: true
    });

    return export.parse(entry)
}


module.exports = {
    exportCSV,
};




