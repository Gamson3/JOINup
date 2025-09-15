import { describe, it, expect } from 'vitest';

describe('Server Functionality', () => {
    it('should return a successful response for the endpoint', async () => {
        const response = await fetch('http://localhost:3000/api/endpoint');
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'Success');
    });

    it('should handle errors correctly', async () => {
        const response = await fetch('http://localhost:3000/api/invalid-endpoint');
        expect(response.status).toBe(404);
    });
});