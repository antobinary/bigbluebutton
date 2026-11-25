#!/usr/bin/env bash
# Ports one pull request merged into v4.0.x-develop to v4.1.x-develop: cherry-picks its change onto a
# sync/v4.1/pr-<N> branch, opens a pull request for it and starts the automated tests on it. A
# maintainer merges it. A port with conflicts is opened as a draft with the "sync: needs maintainer"
# label, and a change that cannot be ported at all is reported on its own pull request.
#
# Run by .github/workflows/sync-v4.0-into-v4.1.yml. Everything about the source pull request comes in
# through the environment and is only ever used quoted: nothing from it is evaluated or executed.
#
# Inputs (env):
#   GH_TOKEN          token for the GitHub API (SYNC_TOKEN when the repository has one, else GITHUB_TOKEN)
#   TOKEN_KIND        "sync" (SYNC_TOKEN: pull requests start the CI themselves) or "github"
#   REPO              owner/name of this repository
#   SOURCE_PR_NUMBER, SOURCE_PR_TITLE, SOURCE_HEAD_REF, SOURCE_HEAD_REPO, SOURCE_AUTHOR
#   SOURCE_LABELS     JSON array with the label names of the source pull request
#   MERGE_SHA         merge_commit_sha of the source pull request
#   WORK_DIR          checkout of the target branch, with push credentials
#   RUN_URL           link to this workflow run
# Optional (env):
#   SOURCE_BRANCH (v4.0.x-develop), TARGET_BRANCH (v4.1.x-develop), CI_WORKFLOW (automated-tests.yml),
#   GIT_REMOTE (origin)
set -euo pipefail

SOURCE_BRANCH=${SOURCE_BRANCH:-v4.0.x-develop}
TARGET_BRANCH=${TARGET_BRANCH:-v4.1.x-develop}
CI_WORKFLOW=${CI_WORKFLOW:-automated-tests.yml}
GIT_REMOTE=${GIT_REMOTE:-origin}
SOURCE_HEAD_REPO=${SOURCE_HEAD_REPO:-}
SOURCE_HEAD_REF=${SOURCE_HEAD_REF:-}
SOURCE_LABELS=${SOURCE_LABELS:-[]}

BOT_EMAIL='41898282+github-actions[bot]@users.noreply.github.com'
NEEDS_MAINTAINER='sync: needs maintainer'
SKIP_LABEL='no-sync-4.1'
# Pull requests that merge a whole line or release ("Merge v4.0.x-release (v4.0.4) into
# v4.0.x-develop", "Merge 4.0.0 rc.2 into ...", branch merge-v4.0.x-release-4.0.4-into-...) are not
# ported: their content reaches 4.1 through the merge-forward of the lines themselves. The title or
# branch has to read "Merge <version> ... into <version>", so "port pull requests merged into
# v4.0.x-develop" or "Fix Merge 4.0 compatibility handling" are not mistaken for one.
LINE_MERGE_RE='(^|[^[:alnum:]])[Mm]erge[ -]v?[0-9]+\.[0-9]+.*[ -]into[ -]v?[0-9]+\.[0-9]+'
LINE_BRANCH_RE='^v[0-9]+\.[0-9]+\.x-(release|develop)$'

: "${GH_TOKEN:?}" "${TOKEN_KIND:?}" "${REPO:?}" "${SOURCE_PR_NUMBER:?}" "${SOURCE_PR_TITLE?}" "${SOURCE_AUTHOR?}"
: "${MERGE_SHA:?}" "${WORK_DIR:?}" "${RUN_URL:?}"

N=$SOURCE_PR_NUMBER
SYNC_BRANCH="sync/v4.1/pr-$N"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

log() { printf '%s\n' "$*" >&2; }

summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"; fi
  log "$*"
}

add_label() {
  local number=$1 name=$2
  jq -n --arg l "$name" '{labels: [$l]}' > "$TMP/labels.json"
  gh api "repos/$REPO/issues/$number/labels" --input "$TMP/labels.json" --silent ||
    log "could not add the label '$name' to #$number"
}

comment() {
  local number=$1 body=$2
  jq -n --arg b "$body" '{body: $b}' > "$TMP/comment.json"
  gh api "repos/$REPO/issues/$number/comments" --input "$TMP/comment.json" --silent ||
    log "could not comment on #$number"
}

# The sync could not produce its pull request (the change cannot be ported as it is, or the push or
# the creation was refused): the source pull request carries the notice and the job fails, so the
# run shows up as failed.
fail_on_source() {
  local reason=$1
  comment "$N" "The automatic port of this change to \`$TARGET_BRANCH\` failed: $reason
A maintainer needs to port it by hand. Details: $RUN_URL"
  add_label "$N" "$NEEDS_MAINTAINER"
  summary "Failed: $reason"
  exit 1
}

# --- Should this pull request be ported? ---------------------------------------------------------

if jq -e --arg l "$SKIP_LABEL" 'index($l) != null' <<< "$SOURCE_LABELS" > /dev/null; then
  comment "$N" "Not ported to \`$TARGET_BRANCH\`: this pull request has the \`$SKIP_LABEL\` label."
  summary "Skipped: #$N has the '$SKIP_LABEL' label."
  exit 0
fi
if [[ $SOURCE_PR_TITLE =~ $LINE_MERGE_RE || $SOURCE_HEAD_REF =~ $LINE_MERGE_RE ]] ||
   { [ "$SOURCE_HEAD_REPO" = "$REPO" ] && [[ $SOURCE_HEAD_REF =~ $LINE_BRANCH_RE ]]; }; then
  comment "$N" "Not ported to \`$TARGET_BRANCH\` automatically: this pull request merges a whole line or release, which reaches \`$TARGET_BRANCH\` through the merge of the lines."
  summary "Skipped: #$N merges a whole line or release; it reaches $TARGET_BRANCH through the line merge."
  exit 0
fi
# An open sync pull request means an earlier run got that far: it stays with the maintainers, and a
# second pull request is never opened.
existing=$(gh api "repos/$REPO/pulls?state=open&head=${REPO%%/*}:$SYNC_BRANCH" --jq '.[0].number // empty')
if [ -n "$existing" ]; then
  summary "Skipped: the port of #$N is already open as #$existing."
  exit 0
fi

# --- Which commits does it bring? ----------------------------------------------------------------

cd "$WORK_DIR"
git config user.name 'github-actions[bot]'
git config user.email "$BOT_EMAIL"

pr_commits=$(gh api "repos/$REPO/pulls/$N" --jq '.commits')
depth=$(( pr_commits + 1 ))
[ "$depth" -ge 2 ] || depth=2
git fetch --no-tags --quiet --depth="$depth" "$GIT_REMOTE" "$MERGE_SHA" "+refs/heads/$TARGET_BRANCH:refs/remotes/$GIT_REMOTE/$TARGET_BRANCH"

parents=$(git rev-list --parents -n 1 "$MERGE_SHA" | wc -w)
parents=$(( parents - 1 ))
mode=squash
draft=false
pick=("$MERGE_SHA")
if [ "$parents" -ge 2 ]; then
  mode=merge-commit
  pick=(-m 1 "$MERGE_SHA")
elif [ "$pr_commits" -gt 1 ]; then
  if ! prev_prs=$(gh api "repos/$REPO/commits/$(git rev-parse "$MERGE_SHA~1")/pulls" --jq '.[].number'); then
    fail_on_source "could not tell from the GitHub API whether #$N was merged by rebase."
  fi
  if grep -qx "$N" <<< "$prev_prs"; then
    # Merged by rebase: its commits sit one after the other on the source branch, and MERGE_SHA is
    # only the last of them.
    fail_on_source "it was merged by rebase with $pr_commits commits, and only pull requests merged with a merge commit or a squash are ported."
  fi
fi
log "Porting #$N ($mode): ${pick[*]}"

# --- Cherry-pick onto the sync branch ------------------------------------------------------------

git checkout --quiet -B "$SYNC_BRANCH" "$GIT_REMOTE/$TARGET_BRANCH"
conflicts=()
export GIT_EDITOR=true
if ! git cherry-pick -x "${pick[@]}" > "$TMP/cherry-pick.log" 2>&1; then
  if [ ! -e "$(git rev-parse --git-path CHERRY_PICK_HEAD)" ]; then
    # Failed without leaving a cherry-pick in progress: not a conflict.
    cat "$TMP/cherry-pick.log" >&2
    fail_on_source "the cherry-pick failed."
  fi
  # Conflicts are committed with their markers so a maintainer can resolve them on the sync branch.
  # With nothing unmerged the commit is already on the target branch, and the pick is skipped; so is
  # one whose conflicts leave nothing to commit.
  mapfile -t conflicts < <(git diff --name-only --diff-filter=U | sort -u)
  [ "${#conflicts[@]}" -eq 0 ] || git add -A
  if [ "${#conflicts[@]}" -eq 0 ] || ! git cherry-pick --continue >> "$TMP/cherry-pick.log" 2>&1; then
    if ! git cherry-pick --skip >> "$TMP/cherry-pick.log" 2>&1; then
      cat "$TMP/cherry-pick.log" >&2
      fail_on_source "the cherry-pick did not complete."
    fi
  fi
fi
cat "$TMP/cherry-pick.log" >&2

if [ -z "$(git rev-list "$GIT_REMOTE/$TARGET_BRANCH..HEAD")" ]; then
  if [ "${#conflicts[@]}" -gt 0 ]; then
    # A conflict that leaves nothing to commit (a deletion of a file that the target branch changed,
    # for example): there is no branch to open as a draft, so the source pull request gets the notice.
    # shellcheck disable=SC2016 # literal backticks: markdown code spans
    conflict_list=$(printf '`%s` ' "${conflicts[@]}")
    fail_on_source "the cherry-pick conflicted in ${conflict_list}and left no change to open a pull request with."
  fi
  comment "$N" "This change is already on \`$TARGET_BRANCH\`; nothing to port."
  summary "Nothing to port: #$N is already on $TARGET_BRANCH."
  exit 0
fi
[ "${#conflicts[@]}" -eq 0 ] || draft=true
if [ "$mode" = merge-commit ]; then
  # cherry-pick -m 1 keeps the author of the merge commit, the person who merged, and its "Merge
  # pull request" subject. The change is the pull request's: the author of its head commit, its title.
  printf '%s (#%s)\n\n(cherry picked from commit %s)\n' "$SOURCE_PR_TITLE" "$N" "$MERGE_SHA" > "$TMP/message"
  git commit --quiet --amend --author="$(git log -1 --format='%an <%ae>' "$MERGE_SHA^2")" -F "$TMP/message"
fi

if ! git push --force --quiet "$GIT_REMOTE" "HEAD:refs/heads/$SYNC_BRANCH" 2> "$TMP/push.log"; then
  cat "$TMP/push.log" >&2
  reason="pushing the \`$SYNC_BRANCH\` branch was refused."
  # shellcheck disable=SC2016 # literal backticks of git's message
  if grep -q 'without `workflows` permission' "$TMP/push.log"; then
    reason="the change touches \`.github/workflows/\`, and the token of this workflow may not push workflow changes. A \`SYNC_TOKEN\` secret with that permission lets the sync handle these changes."
  fi
  fail_on_source "$reason"
fi

# --- Open the sync pull request ------------------------------------------------------------------

title="[4.1] $SOURCE_PR_TITLE (#$N)"
title=${title:0:250}
{
  # shellcheck disable=SC2016 # literal backticks: markdown code spans
  printf 'Automatic port of #%s (by `%s`) from `%s` to `%s`.\n\n' "$N" "$SOURCE_AUTHOR" "$SOURCE_BRANCH" "$TARGET_BRANCH"
  printf -- '- Source commit: %s (%s)\n' "$MERGE_SHA" "$mode"
  printf -- '- Sync run: %s\n' "$RUN_URL"
  if [ "${#conflicts[@]}" -gt 0 ]; then
    printf '\nThe cherry-pick had conflicts in these files. They are committed with their conflict markers and need to be resolved on this branch:\n\n'
    # shellcheck disable=SC2016
    printf -- '- `%s`\n' "${conflicts[@]}"
    # shellcheck disable=SC2016
    printf '\nTo resolve them in a checkout of your own instead, redo the pick on `%s` and push the result to this branch:\n\n' "$TARGET_BRANCH"
    printf '    git cherry-pick -x %s\n' "${pick[*]}"
  fi
  if [ "$draft" = true ]; then
    printf '\nThis pull request needs a maintainer to resolve the conflicts.\n'
  else
    printf '\nA maintainer merges this pull request once its tests have passed.\n'
  fi
} > "$TMP/body.md"
jq -n --arg title "$title" --rawfile body "$TMP/body.md" --arg head "$SYNC_BRANCH" --arg base "$TARGET_BRANCH" \
  --argjson draft "$draft" '{title: $title, body: $body, head: $head, base: $base, draft: $draft}' > "$TMP/pr.json"
if ! SYNC_PR=$(gh api "repos/$REPO/pulls" --input "$TMP/pr.json" --jq '.number'); then
  fail_on_source "the sync pull request for the \`$SYNC_BRANCH\` branch could not be opened."
fi
comment "$N" "Ported to \`$TARGET_BRANCH\` in #$SYNC_PR."
summary "Opened #$SYNC_PR ($mode) for #$N."

if [ "${#conflicts[@]}" -gt 0 ]; then
  add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
  comment "$N" "The port to \`$TARGET_BRANCH\` (#$SYNC_PR) has conflicts and needs a maintainer to resolve them."
  summary "Left open as draft: conflicts in ${conflicts[*]}"
  exit 0
fi

# --- Automated tests -----------------------------------------------------------------------------

# A pull request opened with GITHUB_TOKEN starts no workflow, so the tests are started here; one
# opened with a SYNC_TOKEN starts its own checks. Their result and the merge are a maintainer's.
if [ "$TOKEN_KIND" != sync ]; then
  if response=$(gh api -X POST "repos/$REPO/actions/workflows/$CI_WORKFLOW/dispatches" \
       -f ref="$SYNC_BRANCH" -f 'inputs[jobs]=all' -F return_run_details=true); then
    run_id=$(jq -r '.workflow_run_id // empty' <<< "$response" 2> /dev/null || true)
    tests_url="https://github.com/$REPO/actions/workflows/$CI_WORKFLOW?query=$(jq -rn --arg q "branch:$SYNC_BRANCH" '$q|@uri')"
    [ -z "$run_id" ] || tests_url="https://github.com/$REPO/actions/runs/$run_id"
    comment "$SYNC_PR" "Automated tests started on \`$SYNC_BRANCH\`: $tests_url"
    summary "Started the automated tests for #$SYNC_PR: $tests_url"
  else
    comment "$SYNC_PR" "The automated tests could not be started on \`$SYNC_BRANCH\`. A maintainer needs to start them. Details: $RUN_URL"
    add_label "$SYNC_PR" "$NEEDS_MAINTAINER"
    summary "The automated tests could not be started for #$SYNC_PR."
  fi
fi
