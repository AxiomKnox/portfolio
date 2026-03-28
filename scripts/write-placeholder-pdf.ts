import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const target = path.join(root, "public", "resume.pdf")

mkdirSync(path.dirname(target), { recursive: true })

// Tiny valid PDF (single page, Helvetica, one line of text)
const pdf = `%PDF-1.1
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 64 >>stream
BT /F1 24 Tf 72 720 Td (Resume placeholder) Tj ET
endstream
endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000266 00000 n 
0000000380 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
460
%%EOF
`

writeFileSync(target, pdf, "utf8")
