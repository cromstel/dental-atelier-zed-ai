import bcrypt from "bcryptjs";
import { UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma.js";

const { hash } = bcrypt;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before seeding.",
    );
  }

  const hashedPassword = await hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: UserRole.ADMIN },
    create: {
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      name: "Dental Atelier Admin",
    },
  });

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.create({
      data: {
        author: "Karl",
        content:
          "I was very happy to be served in Dental Atelier. The professional attitude and quality of service is great…thank you.",
      },
    });
  }

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: [
        {
          url: "/images/portfolio-smile-before.webp",
          title: "Before",
          altText: "Patient smile before treatment",
          category: "PORTFOLIO",
        },
        {
          url: "/images/portfolio-smile-after.webp",
          title: "After",
          altText: "Patient smile after treatment",
          category: "PORTFOLIO",
        },
        ...Array.from({ length: 6 }, (_, index) => ({
          url: `/images/about-dental-lab-photo-${String(index + 1).padStart(2, "0")}.webp`,
          title: `Dental Atelier laboratory ${index + 1}`,
          altText: `Dental Atelier laboratory photo ${index + 1}`,
          category: "LAB",
        })),
      ],
    });
  }

  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: "What is a porcelain veneer?",
          answer:
            "A porcelain veneer is a thin ceramic shell bonded to the front of a tooth. A dental professional can advise whether it is appropriate for your needs.",
        },
        {
          question: "What is a crown?",
          answer:
            "A crown covers and protects a tooth when a filling or veneer is not sufficient. Your dentist can assess which restoration is right for you.",
        },
        {
          question: "What is a bridge?",
          answer:
            "A bridge replaces one or more missing teeth and is supported by adjacent teeth or implants.",
        },
      ],
    });
  }

  console.info("Admin account ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
