/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health/route';

describe('API Health Endpoint (/api/health)', () => {
  it('returns HTTP 200 with healthy status and correct application name', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('application', 'devops-cicd-dashboard');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
  });

  it('includes no-store cache headers for live monitoring', async () => {
    const response = await GET();
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBe('no-store, max-age=0');
  });
});
