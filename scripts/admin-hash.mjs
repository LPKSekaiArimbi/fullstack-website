import { randomBytes, scryptSync } from "node:crypto";
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const password = Buffer.concat(chunks)
  .toString()
  .replace(/\r?\n$/, "");
if (password.length < 12 || password.length > 512)
  throw Error("Gunakan 12–512 karakter.");
const salt = randomBytes(16).toString("hex");
console.log(salt + ":" + scryptSync(password, salt, 64).toString("hex"));
