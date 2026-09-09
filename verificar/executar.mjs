// Enumeração independente do shell; as duas réguas continuam separadas.
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const raiz = fileURLToPath(new URL("../", import.meta.url));
const escolhas = process.argv.slice(2);
if (escolhas.length > 1 || escolhas.some((x) => !["contraste", "alvo"].includes(x))) {
  console.error("uso: node verificar/executar.mjs [contraste|alvo]");
  process.exit(2);
}
const arquivos = readdirSync(new URL("../telas/", import.meta.url), { withFileTypes: true })
  .filter((x) => x.isFile() && x.name.endsWith(".html"))
  .map((x) => `telas/${x.name}`).sort();
if (!arquivos.length) {
  console.error("Nenhuma tela HTML encontrada.");
  process.exit(2);
}
for (const nome of escolhas.length ? escolhas : ["contraste", "alvo"]) {
  const resultado = spawnSync(process.execPath, [`verificar/${nome}.mjs`, ...arquivos], {
    cwd: raiz, stdio: "inherit", shell: false,
  });
  if (resultado.error || resultado.signal) {
    console.error(resultado.error ?? `Verificador interrompido: ${resultado.signal}`);
    process.exit(1);
  }
  if (resultado.status !== 0) process.exit(resultado.status ?? 1);
}
