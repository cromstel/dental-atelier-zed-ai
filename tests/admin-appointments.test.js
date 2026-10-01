jest.mock('../lib/admin-auth', () => ({ requireAdmin: jest.fn() }));
jest.mock('../lib/prisma', () => ({
  prisma: {
    appointment: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import handler from '../pages/api/admin/appointments';
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

describe('admin appointments API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects requests without an administrator session', async () => {
    requireAdmin.mockResolvedValue(null);
    const res = createResponse();

    await handler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(401);
    expect(prisma.appointment.findMany).not.toHaveBeenCalled();
  });

  it('updates an appointment to a supported status', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    prisma.appointment.update.mockResolvedValue({ id: 21, status: 'CONFIRMED' });
    const res = createResponse();

    await handler({ method: 'PUT', body: { id: 21, status: 'confirmed' } }, res);

    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: 21 },
      data: { status: 'CONFIRMED' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ id: 21, status: 'CONFIRMED' });
  });

  it('rejects unsupported statuses before writing', async () => {
    requireAdmin.mockResolvedValue({ user: { role: 'ADMIN' } });
    const res = createResponse();

    await handler({ method: 'PUT', body: { id: 21, status: 'ARCHIVED' } }, res);

    expect(res.statusCode).toBe(400);
    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});
