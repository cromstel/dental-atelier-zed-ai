jest.mock('../lib/admin-auth', () => ({ requireAdmin: jest.fn() }));
jest.mock('../lib/prisma', () => ({
  prisma: {
    testimonial: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import handler from '../pages/api/admin/testimonials';
import { requireAdmin } from '../lib/admin-auth';
import { prisma } from '../lib/prisma';

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

describe('admin testimonials API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects requests without an administrator session', async () => {
    requireAdmin.mockResolvedValue(null);
    const res = createResponse();

    await handler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(401);
    expect(prisma.testimonial.findMany).not.toHaveBeenCalled();
  });

  it('trims and stores a validated testimonial', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    prisma.testimonial.create.mockResolvedValue({ id: 12, author: 'Rita', content: 'A kind review.' });
    const res = createResponse();

    await handler({ method: 'POST', body: { author: ' Rita ', content: ' A kind review. ' } }, res);

    expect(prisma.testimonial.create).toHaveBeenCalledWith({
      data: { author: 'Rita', content: 'A kind review.' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({ id: 12, author: 'Rita' });
  });

  it('rejects missing content before writing', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();

    await handler({ method: 'POST', body: { author: 'Rita', content: '  ' } }, res);

    expect(res.statusCode).toBe(400);
    expect(prisma.testimonial.create).not.toHaveBeenCalled();
  });
});
