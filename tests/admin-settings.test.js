jest.mock('../lib/admin-auth', () => ({ requireAdmin: jest.fn() }));
jest.mock('../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    setting: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import adminHandler from '../pages/api/admin/settings';
import publicHandler from '../pages/api/site-settings';
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
  };
}

describe('site settings APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.setting.upsert.mockImplementation((operation) => Promise.resolve(operation));
    prisma.$transaction.mockImplementation((operations) => Promise.all(operations));
  });

  it('does not expose admin settings without an administrator session', async () => {
    requireAdmin.mockResolvedValue(null);
    const res = createResponse();

    await adminHandler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(401);
    expect(prisma.setting.findMany).not.toHaveBeenCalled();
  });

  it('validates and saves only the supported public contact fields', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();
    const body = {
      contactAddress: '  1 Main Street, Brussels  ',
      contactEmail: ' HELLO@example.com ',
      contactPhone: '+32 123 456 789',
      unexpected: 'ignored',
    };

    await adminHandler({ method: 'PUT', body }, res);

    expect(prisma.setting.upsert).toHaveBeenCalledTimes(3);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      contactAddress: '1 Main Street, Brussels',
      contactEmail: 'hello@example.com',
      contactPhone: '+32 123 456 789',
    });
  });

  it('rejects invalid contact values without writing', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();

    await adminHandler({ method: 'PUT', body: { contactAddress: 'Address', contactEmail: 'not-an-email', contactPhone: '' } }, res);

    expect(res.statusCode).toBe(400);
    expect(prisma.setting.upsert).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('publishes only whitelisted site settings', async () => {
    prisma.setting.findMany.mockResolvedValue([
      { key: 'contactAddress', value: '2 Main Street' },
      { key: 'contactEmail', value: 'hello@example.com' },
      { key: 'privateKey', value: 'must not be returned' },
    ]);
    const res = createResponse();

    await publicHandler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Cache-Control']).toBe('no-store');
    expect(res.body).toEqual({
      contactAddress: '2 Main Street',
      contactEmail: 'hello@example.com',
      contactPhone: '',
    });
  });
});
