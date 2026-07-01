import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { client } from './client';


describe('Health Controller', () => {
  it('retorna 200 e status ok', async () => {
    const res = await client.get('/api/health')
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("ok");
  });
})
