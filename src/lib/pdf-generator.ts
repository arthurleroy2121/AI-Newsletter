import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import type { NewsItem } from "./types";
import { PDF_COLORS, APP_NAME } from "@/config/constants";

// Valid TTF files start with 0x00010000
const TTF_MAGIC = Buffer.from([0x00, 0x01, 0x00, 0x00]);

function validateTTF(fontPath: string, fontBuffer: Buffer): void {
  if (fontBuffer.length < 4 || !fontBuffer.subarray(0, 4).equals(TTF_MAGIC)) {
    throw new Error(
      `Font file is corrupted or not a valid TTF: ${fontPath}. ` +
        `Re-download Inter fonts from https://github.com/rsms/inter/releases`
    );
  }
}

function loadFonts(doc: jsPDF): void {
  const fontDir = path.join(process.cwd(), "public", "fonts");

  const regularPath = path.join(fontDir, "Inter-Regular.ttf");
  const boldPath = path.join(fontDir, "Inter-Bold.ttf");

  const regularBuffer = fs.readFileSync(regularPath);
  const boldBuffer = fs.readFileSync(boldPath);

  validateTTF(regularPath, regularBuffer);
  validateTTF(boldPath, boldBuffer);

  const regularFont = regularBuffer.toString("base64");
  const boldFont = boldBuffer.toString("base64");

  doc.addFileToVFS("Inter-Regular.ttf", regularFont);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal", undefined, "Identity-H");
  doc.addFileToVFS("Inter-Bold.ttf", boldFont);
  doc.addFont("Inter-Bold.ttf", "Inter", "bold", undefined, "Identity-H");
  doc.setFont("Inter");
}

function setColor(
  doc: jsPDF,
  color: { r: number; g: number; b: number }
): void {
  doc.setTextColor(color.r, color.g, color.b);
}

function formatDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderCoverPage(doc: jsPDF, date: string): void {
  const pageWidth = 210;
  const { primary, secondary, accent, lightAccent } = PDF_COLORS;

  // Light accent background rectangle (top 60%)
  doc.setFillColor(lightAccent.r, lightAccent.g, lightAccent.b);
  doc.rect(0, 0, pageWidth, 178, "F");

  // Title: NEWS IA
  doc.setFont("Inter", "bold");
  doc.setFontSize(48);
  setColor(doc, primary);
  doc.text(APP_NAME, pageWidth / 2, 85, { align: "center" });

  // Accent line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(1);
  doc.line(85, 95, 125, 95);

  // Subtitle
  doc.setFont("Inter", "normal");
  doc.setFontSize(14);
  setColor(doc, secondary);
  doc.text("Résumé quotidien de", pageWidth / 2, 115, { align: "center" });
  doc.text("l'intelligence artificielle", pageWidth / 2, 123, {
    align: "center",
  });

  // Date
  doc.setFontSize(12);
  setColor(doc, secondary);
  doc.text(date, pageWidth / 2, 160, { align: "center" });

  // Tagline
  doc.setFontSize(11);
  doc.text("Top 3 des actualités IA", pageWidth / 2, 180, {
    align: "center",
  });
  doc.text("des dernières 24 heures", pageWidth / 2, 188, {
    align: "center",
  });
}

function renderNewsPage(
  doc: jsPDF,
  news: NewsItem,
  index: number,
  date: string
): void {
  const pageWidth = 210;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  const { primary, secondary, accent } = PDF_COLORS;

  // Header bar
  doc.setFont("Inter", "bold");
  doc.setFontSize(10);
  setColor(doc, primary);
  doc.text(APP_NAME, marginX, 18);

  doc.setFont("Inter", "normal");
  setColor(doc, secondary);
  doc.text(`Actualité ${index + 1}/3`, pageWidth / 2, 18, {
    align: "center",
  });
  doc.text(date, pageWidth - marginX, 18, { align: "right" });

  // Header accent line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(marginX, 22, pageWidth - marginX, 22);

  // Large number
  doc.setFont("Inter", "bold");
  doc.setFontSize(60);
  setColor(doc, accent);
  doc.text(String(index + 1), marginX, 55);

  // Title
  doc.setFont("Inter", "bold");
  doc.setFontSize(22);
  setColor(doc, primary);
  const titleLines: string[] = doc.splitTextToSize(news.title, contentWidth);
  let titleY = 68;
  for (const line of titleLines) {
    doc.text(line, marginX, titleY);
    titleY += 10;
  }

  // Short accent line below title
  const accentLineY = titleY + 5;
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.8);
  doc.line(marginX, accentLineY, marginX + 25, accentLineY);

  // Description
  doc.setFont("Inter", "normal");
  doc.setFontSize(12);
  setColor(doc, secondary);
  const descLines: string[] = doc.splitTextToSize(
    news.description,
    contentWidth
  );
  let descY = accentLineY + 12;
  for (const line of descLines) {
    doc.text(line, marginX, descY);
    descY += 7;
  }

  // Source at bottom
  const sourceY = 262;
  doc.setFont("Inter", "normal");
  doc.setFontSize(9);
  setColor(doc, secondary);
  doc.text(`Source : ${news.source}`, marginX, sourceY);

  doc.setFontSize(8);
  setColor(doc, accent);
  const urlText =
    news.url.length > 80 ? news.url.substring(0, 80) + "..." : news.url;
  doc.text(urlText, marginX, sourceY + 6);

  // Footer line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.3);
  doc.line(marginX, 278, pageWidth - marginX, 278);

  // Page number
  doc.setFont("Inter", "normal");
  doc.setFontSize(8);
  setColor(doc, secondary);
  doc.text(`News IA — Page ${index + 2}/4`, pageWidth / 2, 284, {
    align: "center",
  });
}

export function generatePDF(news: NewsItem[]): ArrayBuffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  loadFonts(doc);

  const date = formatDate();

  // Page 1: Cover
  renderCoverPage(doc, date);

  // Pages 2-4: News items
  for (let i = 0; i < news.length; i++) {
    doc.addPage();
    renderNewsPage(doc, news[i], i, date);
  }

  return doc.output("arraybuffer");
}
