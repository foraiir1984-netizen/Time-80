import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { assess } = createRequire(import.meta.url)(
  "../scripts/verify-rc-gates.cjs",
);
const repo = "foraiir1984-netizen/Time-80",
  sha = "a".repeat(40),
  branch = "feat/time80-v0.3-implementation";
const run = {
  head_sha: sha,
  head_branch: branch,
  head_repository: { full_name: repo },
  event: "push",
  status: "completed",
  conclusion: "success",
};
const jobs = [
  { name: "validate", status: "completed", conclusion: "success" },
  { name: "release", status: "completed", conclusion: "skipped" },
];
test("RC gate fails closed for other SHA/repo/branch, failed/missing tests and a release job; accepts only exact successful push evidence", () => {
  assert.equal(assess(run, jobs, sha, repo, branch, "validate"), true);
  assert.equal(
    assess(
      { ...run, status: "in_progress" },
      [],
      sha,
      repo,
      branch,
      "validate",
    ),
    false,
  );
  for (const patch of [
    { head_sha: "b".repeat(40) },
    { head_branch: "main" },
    { head_repository: { full_name: "fork/repo" } },
    { event: "workflow_dispatch" },
    { conclusion: "failure" },
    { conclusion: "cancelled" },
  ])
    assert.throws(() =>
      assess({ ...run, ...patch }, jobs, sha, repo, branch, "validate"),
    );
  assert.throws(() => assess(run, [], sha, repo, branch, "validate"));
  assert.throws(() =>
    assess(
      run,
      [{ ...jobs[0], conclusion: "skipped" }, jobs[1]],
      sha,
      repo,
      branch,
      "validate",
    ),
  );
  assert.throws(() =>
    assess(
      run,
      [jobs[0], { ...jobs[1], conclusion: "success" }],
      sha,
      repo,
      branch,
      "validate",
    ),
  );
  assert.equal(
    assess(
      run,
      [{ name: "verify-debug", status: "completed", conclusion: "success" }],
      sha,
      repo,
      branch,
      "verify-debug",
    ),
    true,
  );
});
