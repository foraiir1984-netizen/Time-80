// RC signing may start only after both ordinary push workflows succeeded at this exact SHA.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const required = [
  { file: "build-android-apk.yml", job: "validate" },
  { file: "verify-android-native.yml", job: "verify-debug" },
];
function assess(run, jobs, sha, repo, branch, job) {
  assert.equal(run.head_sha, sha, "Gate SHA mismatch");
  assert.equal(run.head_branch, branch, "Gate branch mismatch");
  assert.equal(run.head_repository.full_name, repo, "Gate repository mismatch");
  assert.equal(run.event, "push", "Only ordinary push validation is accepted");
  if (run.status !== "completed") return false;
  assert.equal(
    run.conclusion,
    "success",
    "Verification workflow did not succeed",
  );
  const check = jobs.find((j) => j.name === job);
  assert.ok(check, "Required verification job missing: " + job);
  assert.equal(check.status, "completed");
  assert.equal(
    check.conclusion,
    "success",
    "Required verification job did not pass",
  );
  if (job === "validate") {
    const release = jobs.find((j) => j.name === "release");
    assert.ok(
      release && release.conclusion === "skipped",
      "Legacy release job must be skipped",
    );
  }
  return true;
}
async function main() {
  const {
    GITHUB_TOKEN: token,
    GITHUB_REPOSITORY: repo,
    GITHUB_SHA: sha,
    GITHUB_REF_NAME: branch,
    RUNNER_TEMP,
  } = process.env;
  assert.ok(token);
  assert.match(sha, /^[0-9a-f]{40}$/);
  assert.equal(repo, "foraiir1984-netizen/Time-80");
  assert.equal(branch, "feat/time80-v0.3-implementation");
  async function api(path) {
    const response = await fetch(
      "https://api.github.com/repos/" + repo + path,
      {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(30000),
      },
    );
    assert.ok(response.ok, "GitHub gate query failed: HTTP " + response.status);
    return response.json();
  }
  const deadline = Date.now() + 70 * 60 * 1000;
  while (Date.now() < deadline) {
    const verified = [];
    for (const gate of required) {
      const data = await api(
        "/actions/workflows/" +
          gate.file +
          "/runs?event=push&head_sha=" +
          sha +
          "&branch=" +
          encodeURIComponent(branch) +
          "&per_page=100",
      );
      const run = data.workflow_runs
        .filter(
          (r) =>
            r.head_sha === sha &&
            r.head_branch === branch &&
            r.event === "push",
        )
        .sort((a, b) => b.run_number - a.run_number)[0];
      if (!run) {
        console.log(gate.file + ": waiting for ordinary push run");
        continue;
      }
      const jobs =
        run.status === "completed"
          ? (await api("/actions/runs/" + run.id + "/jobs?per_page=100")).jobs
          : [];
      if (assess(run, jobs, sha, repo, branch, gate.job))
        verified.push({
          workflow: gate.file,
          job: gate.job,
          runId: run.id,
          runAttempt: run.run_attempt,
          url: run.html_url,
          sha,
          conclusion: "success",
        });
      else console.log(gate.file + ": " + run.status);
    }
    if (verified.length === required.length) {
      fs.writeFileSync(
        RUNNER_TEMP + "/RC2-validation-gates.json",
        JSON.stringify(verified, null, 2),
      );
      console.log("Both normal push gates succeeded at " + sha);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
  throw Error(
    "Timed out waiting for both normal push verification gates; signing is blocked",
  );
}
module.exports = { assess };
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
