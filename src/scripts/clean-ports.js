import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PORTS = {
  MOCK_SERVER: 8080,
  WEBPACK_DEV_SERVER: 3004,
  WEBPACK_DEV_SERVER_STANDALONE: 4040,
};

const isWindows = process.platform === "win32";

function parseWindowsNetstatOutput(stdout) {
  const lines = stdout.trim().split("\n");
  const pids = new Set();

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 0) continue;

    const pid = parts[parts.length - 1];
    if (pid && !isNaN(parseInt(pid))) {
      pids.add(pid);
    }
  }

  return Array.from(pids);
}

function parseUnixLsofOutput(stdout) {
  return stdout
    .trim()
    .split("\n")
    .filter((pid) => pid && !isNaN(parseInt(pid)));
}

async function findProcessByPort(port) {
  try {
    let command;
    if (isWindows) {
      command = `netstat -ano | findstr ":${port}"`;
    } else {
      command = `lsof -ti:${port}`;
    }

    const { stdout } = await execAsync(command);

    if (isWindows) {
      return parseWindowsNetstatOutput(stdout);
    } else {
      return parseUnixLsofOutput(stdout);
    }
  } catch (error) {
    return [];
  }
}

async function killProcess(pid) {
  try {
    let command;
    if (isWindows) {
      command = `taskkill /PID ${pid} /F`;
    } else {
      command = `kill -9 ${pid}`;
    }

    await execAsync(command);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao finalizar processo ${pid}:`, error.message);
    return false;
  }
}

async function cleanPort(port, portName) {
  // eslint-disable-next-line no-console
  console.log(`\n🔍 Verificando porta ${port} (${portName})...`);

  const pids = await findProcessByPort(port);

  if (pids.length === 0) {
    // eslint-disable-next-line no-console
    console.log(`✅ Porta ${port} está livre`);
    return { cleaned: false, pids: [] };
  }

  // eslint-disable-next-line no-console
  console.log(
    `⚠️  Encontrados ${pids.length} processo(s) usando a porta ${port}: ${pids.join(", ")}`
  );

  let successCount = 0;
  for (const pid of pids) {
    const killed = await killProcess(pid);
    if (killed) {
      // eslint-disable-next-line no-console
      console.log(`✅ Processo ${pid} finalizado com sucesso`);
      successCount++;
    }
  }

  if (successCount === pids.length) {
    // eslint-disable-next-line no-console
    console.log(`✅ Porta ${port} liberada`);
    return { cleaned: true, pids };
  } else {
    // eslint-disable-next-line no-console
    console.log(`⚠️  Alguns processos não puderam ser finalizados`);
    return { cleaned: false, pids };
  }
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("=".repeat(60));
  // eslint-disable-next-line no-console
  console.log("🧹 Limpando portas de desenvolvimento");
  // eslint-disable-next-line no-console
  console.log("=".repeat(60));

  const results = {
    mockServer: await cleanPort(PORTS.MOCK_SERVER, "Mock Server"),
    webpackDevServer: await cleanPort(PORTS.WEBPACK_DEV_SERVER, "Webpack Dev Server"),
    webpackDevServerStandalone: await cleanPort(
      PORTS.WEBPACK_DEV_SERVER_STANDALONE,
      "Webpack Dev Server (Standalone)"
    ),
  };

  // eslint-disable-next-line no-console
  console.log(`\n${"=".repeat(60)}`);

  const totalCleaned =
    (results.mockServer.cleaned ? results.mockServer.pids.length : 0) +
    (results.webpackDevServer.cleaned ? results.webpackDevServer.pids.length : 0) +
    (results.webpackDevServerStandalone.cleaned
      ? results.webpackDevServerStandalone.pids.length
      : 0);

  if (totalCleaned > 0) {
    // eslint-disable-next-line no-console
    console.log(`✅ Limpeza concluída: ${totalCleaned} processo(s) finalizado(s)`);
  } else {
    // eslint-disable-next-line no-console
    console.log("✅ Todas as portas já estão livres");
  }

  // eslint-disable-next-line no-console
  console.log(`${"=".repeat(60)}\n`);
}

const isDirectExecution =
  process.argv[1]?.includes("clean-ports.js") || import.meta.url.includes("clean-ports.js");

if (isDirectExecution) {
  main().catch((error) => {
    console.error("❌ Erro ao limpar portas:", error);
    process.exit(1);
  });
}

export { cleanPort, findProcessByPort, killProcess };
