const { expect } = require('chai');
const { exportCSV } = require('../../../src/helpers/exportCSV');



describe('Export CSV helper', () => {

   const mockUserId = '507f1f77bcf86cd799439011';

    it('should export model data to CSV', () => {
        const mockEntry = {
            _id: 'entry1',
            userId: mockUserId,
            entryDate: new Date('2026-01-01'),
            duration: 480,

        };

        const mockOutput = exportCSV([mockEntry]);
        const expected = `"${"_id"}","userId","entryDate","duration"\n` + `"entry1","${mockUserId}","2026-01-01T00:00:00.000Z",480`;

        expect(mockOutput).to.be.a('string');
        expect(mockOutput).to.equal(expected); 
    });

});
