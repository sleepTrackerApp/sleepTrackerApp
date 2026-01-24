const { expect } = require('chai');
const { _buildPrompt } = require('../../../src/helpers/ai');

describe('AI Helper: Prompt Construction Logic (Mocha/Chai)', () => {
    const mockUserGoal = 480; // 8 hours
    const mockLogs = [
        { entryDate: new Date('2026-01-20'), duration: 420, rating: 8 },
        { entryDate: new Date('2026-01-21'), duration: 480, rating: 9 }
    ]; //

    it('should adopt the "Alive Sleep Scientist" persona', () => {
        const prompt = _buildPrompt(mockUserGoal, mockLogs, 'weekly');
        expect(prompt).to.include("You are the 'Alive' Sleep Scientist");
        expect(prompt).to.include("encouraging");
    });

    it('should correctly map SleepEntry duration and rating fields', () => {
        const prompt = _buildPrompt(mockUserGoal, mockLogs, 'weekly');
        expect(prompt).to.include("Duration: 420m");
        expect(prompt).to.include("Rating: 9/10");
    });

    it('should enforce the 7-9 hour research-backed goal range', () => {
        const prompt = _buildPrompt(mockUserGoal, mockLogs, 'weekly');
        expect(prompt).to.include("Range: 7-9 hours");
        expect(prompt).to.include("480 minutes");
    });

    it('should request the 50/30/20 scoring rationale', () => {
        const prompt = _buildPrompt(mockUserGoal, mockLogs, 'weekly');
        expect(prompt).to.include("50% Goal Achievement");
        expect(prompt).to.include("30% Consistency");
        expect(prompt).to.include("20% Subjective Quality");
    });

    it('should require a strict JSON response', () => {
        const prompt = _buildPrompt(mockUserGoal, mockLogs, 'weekly');
        expect(prompt).to.include("strictly in this JSON format");
        expect(prompt).to.include('"score"');
        expect(prompt).to.include('"insight"');
    });
});