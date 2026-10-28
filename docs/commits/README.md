# Separate milestone commits

M6/M7 patches were prepared against M5 commit `63708c3`. M6 contains tower
inspection and path guides. M7 contains combat feedback. M8 is based on the M7
snapshot, committed as `1f00b44`, and contains the in-game help panel. Each patch
excludes `package-lock.json`, later milestone changes, and preparation files.
M9 is based on M8 commit `805cbdf` and contains the B/N/R shortcuts and instructions.
M10 is based on M9 commit `1ec2a45` and contains optional generated combat audio.
M11 is based on M10 commit `baa4f9b` and contains the campaign/story/map expansion.
M12 is based on M11 commit `a235c84` and contains enemy types and wave composition.
M13 is based on M12 commit `e078922` and contains tower choices and combat profiles.
M14 is based on M13 commit `224b6bb` and contains terrain, fortress, shadows, and walking.
M15 is based on M14 commit `0583a9e` and contains projectile/damage/wave feedback.

M6 through M14 are already committed in this checkout, with M14 at `0583a9e`.
Continue with M15 below; earlier commands remain as a historical guide.

The agent verified that applying the patch contents in sequence reconstructs the
reviewed M6 snapshot, then the reviewed M7 snapshot exactly. This content check
does not replace local test/build execution or Git's own patch checks below.
M8 was also checked against the actual M7 file contents: its patch reconstructs
the saved M8 snapshot. It omits the temporary link to these local preparation
files from the main README, so that the M8 commit is self-contained.
M9's patch was checked against the actual M8 HEAD contents and reconstructs the
saved M9 snapshot, including all three modified files.
M10's patch was checked against actual M9 contents and reconstructs all six saved
M10 files. Its written artifact was compared with that verified patch exactly.
M11 was checked against actual M10 contents and reconstructs all eight saved M11
files. Its written artifact was also compared with that verified patch exactly.
M12 was checked against actual M11 contents and reconstructs all nine saved M12
files. Its written artifact was also compared with that verified patch exactly.
M13 was checked against actual M12 contents and reconstructs all eight saved M13
files. Its written artifact was also compared with that verified patch exactly.
M14 was checked against actual M13 contents and reconstructs all ten saved M14
files. Its written artifact was also compared with that verified patch exactly.
M15 was checked against actual M14 contents and reconstructs all seven saved M15
files. Its written artifact was also compared with that verified patch exactly.
For M6/M7, the hook denied the agent's read-only `git apply --stat` commands because
it requires human execution for the `git apply` command group. The agent stopped
that execution path; run the `--check` commands below in your own terminal.

Run the commands yourself in PowerShell from the repository root. Start with an
empty staging area: `git diff --cached` should print nothing. If it already has
changes, review them before proceeding. Stop on any command error.

## If M6 is already staged

If checking M6 reports `patch does not apply` and `already exists in index`, inspect
`git diff --cached` and `git log -2 --oneline`. The patch may already be staged.
The reviewed M6 staging contains only `README.md`, `src/scenes/GameScene.ts`, and
the new `src/scenes/drawPathGuides.ts` (186 insertions, 20 deletions).

When that staged diff matches M6 and HEAD is still M5, continue directly with:

```powershell
git commit -m "feat: add M6 tower inspection and path guides"
```

Then proceed to the M7 section after commit succeeds. Each patch is applied once;
its `--check` command validates the state before that application. If Git history
already contains the M6 commit, proceed to M7 instead. Review any other staged
content before taking action.

## M6

The following commands stage the M6 snapshot in the index. They leave your working
files, including later milestone changes, in place.

```powershell
git apply --cached --check docs/commits/M6.patch
git apply --cached docs/commits/M6.patch
git diff --cached
git commit -m "feat: add M6 tower inspection and path guides"
```

Review the staged diff before running commit. Enter `COMMIT` in your terminal if
the Git hook prompts. Continue only after this commit succeeds.

## M7

```powershell
git apply --cached --check docs/commits/M7.patch
git apply --cached docs/commits/M7.patch
git diff --cached
git commit -m "feat: add M7 combat feedback"
```

Review and confirm this commit in the same way. These patches already stage their
exact snapshots; additional staging of the working files would include later work.

## M8

Start from the M7 commit with an empty staging area. The M8 patch stages only
`README.md`, `src/scenes/GameScene.ts`, and `src/scenes/createHelpPanel.ts`.
Your current working files can already contain M9; staging this snapshot preserves
those later edits in the working directory.

```powershell
git apply --cached --check docs/commits/M8.patch
git apply --cached docs/commits/M8.patch
git diff --cached
git commit -m "feat: add M8 in-game help"
```

Review the staged M8 diff, then enter `COMMIT` if the Git hook prompts. If the M8
patch is already staged, review that staged diff and continue directly with the
commit instead of applying the same patch again. Stop on any other error.

```powershell
git log -2 --oneline
git status --short
```

## M9

Start from M8 with an empty staging area. This patch stages only `README.md`,
`src/scenes/GameScene.ts`, and `src/scenes/createHelpPanel.ts` as reviewed for M9.
It preserves later working-directory edits, including any M10 work.

```powershell
git apply --cached --check docs/commits/M9.patch
git apply --cached docs/commits/M9.patch
git diff --cached
git commit -m "feat: add M9 keyboard shortcuts"
```

Review the staged diff and confirm `COMMIT` in your terminal if prompted. Apply
the patch only once; if M9 is already staged, review it and proceed directly to
commit. If M9 is already committed, inspect Git history rather than applying its
patch again. Stop on any other error.

## M10

Start from M9 with an empty staging area. This patch stages the reviewed M10
versions of `README.md`, `Enemy.ts`, `GameScene.ts`, and `createHelpPanel.ts`, plus
the new `CombatAudio.ts` and `CombatAudio.test.ts`. It excludes M11's levels,
story/menu, map graphics, tests, and roadmap, and preserves current working files.

```powershell
git apply --cached --check docs/commits/M10.patch
git apply --cached docs/commits/M10.patch
git diff --cached
git commit -m "feat: add M10 toggleable combat audio"
```

Review the staged diff and enter `COMMIT` in the terminal if prompted. If M10 is
already staged, review it and proceed directly to commit. If it is already
committed, inspect Git history instead of applying the patch again. Stop on any
other error; each patch is applied once.

## M11

Start from M10 with an empty staging area. This patch stages only the reviewed
M11 campaign files: `README.md`, `GameScene.ts`, `createHelpPanel.ts`,
`drawPathGuides.ts`, `levels.ts`, `createLevelPanel.ts`, `levels.test.ts`, and
`docs/roadmap.md`. M12 enemy profiles, typed waves, rendering, tests, and help
changes remain in the working directory.

```powershell
git apply --cached --check docs/commits/M11.patch
git apply --cached docs/commits/M11.patch
git diff --cached
git commit -m "feat: add M11 fantasy campaign and level selection"
```

Review the staged diff and enter `COMMIT` in your terminal if prompted. Apply
the patch once. If M11 is already staged, review it and proceed directly to
commit; if already committed, check Git history instead. Stop on other errors.

After the M11 commit, M12 work, `package-lock.json`, and the preparation files
remain uncommitted. Test/build results for earlier milestones remain as recorded
in their README snapshots; tests and builds in the current working directory
validate the current working code.

## M12

Start from M11 with an empty staging area. This patch stages the reviewed M12
versions of `README.md`, `docs/roadmap.md`, `levels.ts`, `Enemy.ts`, `GameScene.ts`,
`createHelpPanel.ts`, and `levels.test.ts`, plus the new `enemyConfig.ts` and
`EnemyTypes.test.ts`. M13 tower choices remain in the working directory.

```powershell
git apply --cached --check docs/commits/M12.patch
git apply --cached docs/commits/M12.patch
git diff --cached
git commit -m "feat: add M12 enemy types and wave composition"
```

Review the staged diff and enter `COMMIT` in your terminal if prompted. Apply
the patch once. If M12 is already staged, review it and proceed directly to
commit; if already committed, check Git history instead. Stop on other errors.
Do not stage the current working files over the snapshot, as they include M13.

After the M12 commit, M13, the existing `package-lock.json` changes, and preparation
files remain uncommitted. Tests/builds in the working directory validate current
code; the M12 README snapshot records its own validation limitations.

## M13

Start from M12 with an empty staging area. The patch stages only the reviewed M13
versions of `README.md`, `docs/roadmap.md`, `Projectile.ts`, `Tower.ts`,
`GameScene.ts`, and `createHelpPanel.ts`, plus the new `towerConfig.ts` and
`TowerTypes.test.ts`. M14 graphics, enemy animation, and test-fixture updates stay
in the working directory.

```powershell
git apply --cached --check docs/commits/M13.patch
git apply --cached docs/commits/M13.patch
git diff --cached
git commit -m "feat: add M13 tower choices and combat profiles"
```

Review the staged diff and enter `COMMIT` in your terminal if prompted. Apply the
patch once. If M13 is already staged, review it and proceed directly to commit;
if already committed, check Git history instead. Stop on other errors. Additional
staging of the current files would include M14.

After committing M13, M14, existing `package-lock.json` changes, and preparation
files remain uncommitted. Working-directory tests/builds validate current code;
the M13 README snapshot records M13's own verification limitations.

## M14

Start from M13 with an empty staging area. This patch stages the reviewed M14
versions of `README.md`, `docs/roadmap.md`, `Enemy.ts`, `Tower.ts`, `GameScene.ts`,
`drawPathGuides.ts`, and `TowerTypes.test.ts`, plus the new `docs/playtest-M14.md`,
`drawTerrain.ts`, and `EnemyPresentation.test.ts`. It excludes the existing
`package-lock.json` changes and M15's combat/wave feedback.

```powershell
git apply --cached --check docs/commits/M14.patch
git apply --cached docs/commits/M14.patch
git diff --cached
git commit -m "feat: add M14 terrain fortress and animation polish"
```

Review the staged diff and enter `COMMIT` in your terminal if prompted. Apply the
patch once. If M14 is already staged, review it and proceed directly to commit;
if already committed, check Git history instead. Stop on other errors. Additional
staging of the current files would include M15.

After the commit, M15, `package-lock.json`, and preparation files remain
uncommitted. Working-directory tests/builds validate current code; the M14 README
snapshot records M14's verification limitations before M15.

## M15

Start from M14 with an empty staging area. This patch stages only the reviewed
M15 versions of `README.md`, `docs/roadmap.md`, `Enemy.ts`, `Projectile.ts`,
`GameScene.ts`, and `EnemyPresentation.test.ts`, plus the new `showWaveBanner.ts`.
The proposed art plan and its documentation links stay in the working directory.
Existing `package-lock.json` changes and preparation files are excluded.

```powershell
git apply --cached --check docs/commits/M15.patch
git apply --cached docs/commits/M15.patch
git diff --cached
git commit -m "feat: add M15 projectile damage and wave feedback"
```

Review the staged diff and enter `COMMIT` in your terminal if prompted. Apply the
patch once. If M15 is already staged, review it and proceed directly to commit;
if already committed, check Git history instead. Stop on other errors. Additional
staging of the current documentation would include the next art plan.

After the commit, planning/preparation files and existing `package-lock.json`
changes remain uncommitted. The M15 README snapshot records its test/build
limitations; the art plan authorizes no implementation until separately reviewed.
