import sharp from "sharp"
import { readFileSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const input = join(root, "public", "og-image.png")
const output = join(root, "public", "og-image.png")

const buf = readFileSync(input)
const resized = await sharp(buf)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .png()
  .toBuffer()
writeFileSync(output, resized)
console.log("Resized og-image.png to 1200×630")
