// small hack to avoid using stdout,
// so the script is able to pipe its output
const { error: log } = console;

export async function sample_issues(api, rule) {
  let issues = [];
  let projects = await api.projects();

  for (let { key, name } of projects) {
    log("project", name);

    let entries = await api.issues(key, rule);

    // Getting the source code for a given issue
    entries = await Promise.all(
      entries.map(async (issue) => {
        // log(issue)
        let source = "";
        if (issue.textRange) {
          let { startLine, endLine } = issue.textRange;
          source = await api.sources(issue.component, startLine, endLine);
        }
        return { ...issue, source };
      })
    );

    issues.push(...entries);
  }

  log(`found ${projects.length} projects`);
  log(`extracted ${issues.length} issues`);

  return issues;
}
