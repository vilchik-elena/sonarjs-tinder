import "dotenv/config";

import { make_api } from "./api.js";
import { sample_issues } from "./sampling.js";

// small hack to avoid using stdout,
// so the script is able to pipe its output
const { error: log, log: output } = console;

async function main() {
  const { TOKEN } = process.env;

  // const rule = "javascript:S125"; // commented code
  const rule = "";

  const api = make_api({ token: TOKEN, page_size: 50 });

  let issues = await sample_issues(api, rule);

  log("examples:", issues.slice(0, 1));
  output(JSON.stringify({ issues }));
}

main();
