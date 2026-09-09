import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app';

describe('Backend Express API', () => {
  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('wecode-backend');
  });

  it('POST /api/v1/auth/register fails with 400 for invalid body', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('GET /api/v1/submissions/xyz fails with 401 without auth token', async () => {
    const res = await request(app).get('/api/v1/submissions/test-id');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
