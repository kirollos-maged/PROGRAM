import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

interface CertificateTemplate {
  id: string;
  name: string;
  backgroundUrl?: string;
}

interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  templateId: string;
  verificationCode: string;
  pdfUrl: string;
  issuedAt: string;
}

const router = Router();

const templates: CertificateTemplate[] = [
  { id: "default", name: "Default Certificate" }
];
const certificates: Certificate[] = [];

const issueSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  templateId: z.string().default("default")
});

const createTemplateSchema = z.object({
  name: z.string(),
  backgroundUrl: z.string().url().optional()
});

router.post("/templates", (req, res) => {
  const parsed = createTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const t: CertificateTemplate = {
    id: uuid(),
    ...parsed.data
  };
  templates.push(t);
  res.status(201).json(t);
});

router.get("/templates", (_req, res) => {
  res.json(templates);
});

router.post("/issue", (req, res) => {
  const parsed = issueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const template = templates.find((t) => t.id === parsed.data.templateId);
  if (!template) {
    return res.status(400).json({ error: "Template not found" });
  }
  const issuedAt = new Date().toISOString();
  const verificationCode = uuid();
  const certificate: Certificate = {
    id: uuid(),
    userId: parsed.data.userId,
    courseId: parsed.data.courseId,
    templateId: template.id,
    verificationCode,
    // In a real app this would be a real PDF URL.
    pdfUrl: `/certificates/pdf/${verificationCode}`,
    issuedAt
  };
  certificates.push(certificate);
  res.status(201).json(certificate);
});

router.get("/verify/:code", (req, res) => {
  const cert = certificates.find((c) => c.verificationCode === req.params.code);
  if (!cert) {
    return res.status(404).json({ valid: false });
  }
  res.json({ valid: true, certificate: cert });
});

router.get("/user/:userId", (req, res) => {
  const list = certificates.filter((c) => c.userId === req.params.userId);
  res.json(list);
});

export const certificatesRouter = router;

