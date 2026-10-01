jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../lib/auth', () => ({ authOptions: {} }));
jest.mock('../lib/prisma', () => ({
  prisma: {
    contactMessage: {
      findMany: jest.fn(),
    },
  },
}));

import { getServerSession } from 'next-auth/next';
import { prisma } from '../lib/prisma';
import { getServerSideProps } from '../pages/admin/inquiries';

describe('admin contact inquiries page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirects visitors without an admin session', async () => {
    getServerSession.mockResolvedValue(null);

    const result = await getServerSideProps({ req: {}, res: {} });

    expect(result).toEqual({ redirect: { destination: '/admin/login', permanent: false } });
    expect(prisma.contactMessage.findMany).not.toHaveBeenCalled();
  });

  it('returns recent messages to an administrator', async () => {
    const createdAt = new Date('2025-02-03T12:00:00.000Z');
    const message = {
      id: 9,
      firstName: 'Ari',
      lastName: 'Example',
      email: 'ari@example.com',
      phone: null,
      message: 'Please contact me.',
      inquiryType: 'CONTACT',
      createdAt,
    };
    getServerSession.mockResolvedValue({ user: { role: 'ADMIN' } });
    prisma.contactMessage.findMany.mockResolvedValue([message]);

    const result = await getServerSideProps({ req: {}, res: {} });

    expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    expect(result.props.messages).toEqual([{ ...message, createdAt: createdAt.toISOString() }]);
  });
});
