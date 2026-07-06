import pdfParse from "pdf-parse";

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<string> {
  const data = await pdfParse(buffer);

  if (!data.text.trim()) {
    throw new Error("Resume is empty");
  }

  return data.text.trim();
}