export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return await file.text();
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => item.str).join(" "));
      }
      return pages.join("\n\n");
    } catch (error) {
      throw new Error("PDF text extraction needs the pdfjs-dist dependency. Run npm install in the React app.");
    }
  }

  throw new Error("Supported study files: PDF, TXT and Markdown.");
}
