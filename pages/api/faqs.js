import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const faqs = await prisma.faq.findMany({ orderBy: { id: "asc" } });
    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Unable to load FAQs:", error);
    return res.status(503).json({ error: "FAQs are temporarily unavailable." });
  }
}
