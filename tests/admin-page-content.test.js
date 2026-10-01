jest.mock('../lib/admin-auth', () => ({ requireAdmin: jest.fn() }));
jest.mock('../lib/prisma', () => ({
  prisma: {
    setting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import handler from '../pages/api/admin/page-content';
import { requireAdmin } from '../lib/admin-auth';
import { prisma } from '../lib/prisma';
import { pages } from '../lib/site-content';

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
    async revalidate(path) {
      this.revalidatedPath = path;
    },
  };
}

describe('admin page content API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requires an administrator session', async () => {
    requireAdmin.mockResolvedValue(null);
    const res = createResponse();

    await handler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(401);
    expect(prisma.setting.findMany).not.toHaveBeenCalled();
  });

  it('validates, stores, and revalidates a supported page', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    prisma.setting.upsert.mockResolvedValue({ id: 1 });
    const res = createResponse();
    const page = {
      title: 'Smile portfolio',
      description: 'Examples of smile transformations.',
      intro: 'See a selection of our recent work.',
      sections: [],
    };

    await handler({ method: 'PUT', body: { slug: 'portfolio', ...page } }, res);

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { key: 'page-content:portfolio' },
      update: { value: JSON.stringify(page) },
      create: { key: 'page-content:portfolio', value: JSON.stringify(page) },
    });
    expect(res.revalidatedPath).toBe('/portfolio');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ slug: 'portfolio', page, revalidated: true });
  });

  it('rejects unsupported page slugs', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();

    await handler({ method: 'PUT', body: { slug: '../admin', ...pages.services } }, res);

    expect(res.statusCode).toBe(400);
    expect(prisma.setting.upsert).not.toHaveBeenCalled();
    expect(res.revalidatedPath).toBeUndefined();
  });

  it('rejects changes to the predefined section count', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();

    await handler({
      method: 'PUT',
      body: { slug: 'services', title: 'Services', description: 'Service information.', intro: 'An introduction.', sections: [] },
    }, res);

    expect(res.statusCode).toBe(400);
    expect(prisma.setting.upsert).not.toHaveBeenCalled();
  });
});
