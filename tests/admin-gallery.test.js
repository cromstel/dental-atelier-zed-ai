jest.mock('../lib/admin-auth', () => ({ requireAdmin: jest.fn() }));
jest.mock('../lib/prisma', () => ({
  prisma: {
    galleryImage: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import handler from '../pages/api/admin/gallery';
import { requireAdmin } from '../lib/admin-auth';
import { prisma } from '../lib/prisma';
import { galleryAssets } from '../lib/gallery-assets';

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end() {
      return this;
    },
  };
}

describe('admin gallery API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects requests without an administrator session', async () => {
    requireAdmin.mockResolvedValue(null);
    const res = createResponse();

    await handler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(401);
    expect(prisma.galleryImage.findMany).not.toHaveBeenCalled();
  });

  it('rejects URLs that are not curated local WebP assets', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();

    await handler({
      method: 'POST',
      body: { url: 'https://example.com/image.jpg', title: 'Smile', altText: 'A smile', category: 'PORTFOLIO' },
    }, res);

    expect(res.statusCode).toBe(400);
    expect(prisma.galleryImage.create).not.toHaveBeenCalled();
  });

  it('stores a validated curated image entry', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const asset = galleryAssets[0];
    prisma.galleryImage.create.mockResolvedValue({ id: 7, ...asset });
    const res = createResponse();

    await handler({ method: 'POST', body: asset }, res);

    expect(prisma.galleryImage.create).toHaveBeenCalledWith({
      data: { url: asset.url, title: asset.title, altText: asset.altText, category: asset.category },
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({ id: 7, url: asset.url });
  });
});
