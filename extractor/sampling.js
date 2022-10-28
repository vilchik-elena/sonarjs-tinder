const { log } = console;

export async function sample_issues(api, rule) {
  let issues = [];
  let projects = await api.projects();

  for (let { key, name } of projects) {
    // log("project", name)

    let entries = await api.issues(key, rule);

    // Getting the source code for a given issue
    // if (rule) {
    //   entries = await Promise.all(entries.map(async issue => {
    //   	log(issue)
    //     let { startLine, endLine } = issue.textRange
    //     let source = await api.sources(issue.component, startLine, endLine)
    //     return { ...issue, source }
    //   }))
    // }

    issues.push(...entries);
  }

  return issues;
}
