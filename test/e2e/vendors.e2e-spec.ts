import * as request from 'supertest';
import {
  buildTestApp,
  closeTestApp,
  seedVendor,
  InMemoryStore,
} from './helpers/test-setup';
import { createTestKeypair, signMessage } from './helpers/test-wallet';

describe('Vendors (e2e)', () => {
  let app: any;
  let mockDb: InMemoryStore;
  let adminToken: string;
  let nonAdminToken: string;
  let adminWallet: string;
  let vendorId: string;

  beforeAll(async () => {
    const ctx = await buildTestApp();
    app = ctx.app;
    mockDb = ctx.mockDb;

    // Authenticate as admin wallet
    const adminKeypair = createTestKeypair();
    adminWallet = adminKeypair.publicKey();

    const adminNonceRes = await request(app.getHttpServer())
      .post('/auth/nonce')
      .send({ wallet: adminWallet })
      .expect(201);

    const adminSignature = signMessage(adminKeypair, adminNonceRes.body.nonce);
    const adminVerifyRes = await request(app.getHttpServer())
      .post('/auth/verify')
      .send({ wallet: adminWallet, nonce: adminNonceRes.body.nonce, signature: adminSignature })
      .expect(200);

    adminToken = adminVerifyRes.body.accessToken;

    // Authenticate as non-admin wallet (not in ADMIN_WALLETS)
    const nonAdminKeypair = {
      publicKey: () => 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      secret: () => 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    };

    const nonAdminNonceRes = await request(app.getHttpServer())
      .post('/auth/nonce')
      .send({ wallet: nonAdminKeypair.publicKey() })
      .expect(201);

    const nonAdminSignature = signMessage(nonAdminKeypair, nonAdminNonceRes.body.nonce);
    const nonAdminVerifyRes = await request(app.getHttpServer())
      .post('/auth/verify')
      .send({ wallet: nonAdminKeypair.publicKey(), nonce: nonAdminNonceRes.body.nonce, signature: nonAdminSignature })
      .expect(200);

    nonAdminToken = nonAdminVerifyRes.body.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /vendors', () => {
    it('should create a vendor when admin is authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'University of Lagos',
          type: 'school',
          country: 'NG',
          website: 'https://unilag.edu.ng',
          description: 'A leading Nigerian university.',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('University of Lagos');
      expect(res.body.type).toBe('school');
      expect(res.body.country).toBe('NG');
      expect(res.body.website).toBe('https://unilag.edu.ng');
      expect(res.body.description).toBe('A leading Nigerian university.');
      expect(res.body.verified).toBe(false);

      vendorId = res.body.id;
    });

    it('should return 403 when non-admin is authenticated', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send({
          name: 'Test Bootcamp',
          type: 'bootcamp',
          country: 'US',
          website: 'https://testbootcamp.com',
        })
        .expect(403);
    });

    it('should return 401 when no auth token is provided', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .send({
          name: 'Test Bootcamp',
          type: 'bootcamp',
          country: 'US',
          website: 'https://testbootcamp.com',
        })
        .expect(401);
    });

    it('should return 400 for invalid DTO — name too short', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A',
          type: 'school',
          country: 'NG',
          website: 'https://test.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid DTO — invalid type', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Valid Name',
          type: 'invalid_type',
          country: 'NG',
          website: 'https://test.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid DTO — country not 2 chars', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Valid Name',
          type: 'school',
          country: 'NGA',
          website: 'https://test.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid DTO — invalid website URL', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Valid Name',
          type: 'school',
          country: 'NG',
          website: 'not-a-url',
        })
        .expect(400);
    });
  });

  describe('GET /vendors', () => {
    it('should return paginated list of vendors', async () => {
      await seedVendor(mockDb, { name: 'Seed Vendor A', type: 'school' });
      await seedVendor(mockDb, { name: 'Seed Vendor B', type: 'bootcamp' });

      const res = await request(app.getHttpServer())
        .get('/vendors')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(3);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
    });

    it('should filter vendors by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/vendors?type=school')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      res.body.data.forEach((v: any) => {
        expect(v.type).toBe('school');
      });
    });

    it('should support custom pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/vendors?page=1&limit=1')
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.limit).toBe(1);
      expect(res.body.page).toBe(1);
    });
  });

  describe('GET /vendors/:id', () => {
    it('should return a vendor by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/vendors/${vendorId}`)
        .expect(200);

      expect(res.body.id).toBe(vendorId);
      expect(res.body.name).toBe('University of Lagos');
    });

    it('should return 404 for unknown vendor id', async () => {
      await request(app.getHttpServer())
        .get('/vendors/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
