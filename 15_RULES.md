# 15 Rules for Fixing Game Systems

When fixing or adding gameplay systems, follow these rules every time:

## 1. Find Every Source of Truth First
Before changing anything, inspect all places that control the same system.
For example, for camera:
- Scene transforms
- Script variables
- Input mappings
- Update loops
- Helper functions
- Child/parent nodes

If more than one place controls the same behavior, list them all before editing.

## 2. Resolve Conflicts Before Adding Behavior
If a scene file and a script both control the same thing, do not keep both active.
Choose one source of truth and disable or remove the conflicting one.
Never leave duplicate control paths active.

## 3. Match Coordinate System Reality
Do not assume axis directions.
Check the engine's actual coordinate behavior first.
For 3D:
- Verify what forward/back means
- Verify what positive and negative axes do
- Verify whether the camera is behind or in front before claiming it is correct

## 4. Compare Intended Behavior to Actual Values
Before implementing, explicitly compare:
- Intended position vs actual position
- Intended direction vs actual direction
- Intended controller vs actual controller

If they do not match, explain the mismatch first.

## 5. Remove Broken Logic Before Adding Replacement Logic
Do not patch over old behavior.
If old camera logic is wrong, disable or remove it first.
Then implement the clean version.
Do not layer fixes.

## 6. One System, One Owner
Each major system should have one active controller.
Examples:
- One camera controller
- One movement controller
- One facing-direction controller
- One animation-state controller

If multiple scripts or files control the same thing, flag it as a conflict.

## 7. Separate Systems Cleanly
Do not let unrelated inputs or mechanics contaminate each other.
Examples:
- Movement input should not move the camera unless explicitly intended
- Camera input should not affect movement unless explicitly intended
- Animation should not define gameplay position unless explicitly intended

## 8. Verify Visible Results, Not Just Logs
Do not say something is fixed because logs or variables look correct.
Check whether the on-screen result matches the goal.
Visible behavior is the final truth.

## 9. Diagnose First, Then Fix
For bugs, always do this order:
1. Identify all files/nodes/functions affecting the issue
2. Identify conflicts
3. Identify root cause
4. Say what must be removed or disabled first
5. Only then implement the fix

## 10. Prefer Simple, Stable Architecture
If the current system is broken, prefer the simplest working version over a clever one.
A clean fixed camera is better than a fancy broken one.

## 11. Do Not Hallucinate Structure
Only reference real existing:
- Files
- Nodes
- Functions
- Variables
- Input actions

If something does not exist, say so clearly before creating it.

## 12. Report in This Format Every Time

**Before fixing:**
1. Root cause summary
2. All files/scripts/nodes affecting the system
3. Conflicting logic found
4. What must be removed or disabled first
5. Clean final architecture

**After fixing:**
1. What was removed or disabled
2. What now controls the system
3. Exact values changed
4. What was preserved
5. What I should test on screen

## 13. Never Trust Partial Fixes
If the issue still exists visually, the fix is not complete.
Do not keep adding offset tweaks or smoothing values to hide a structural problem.

## 14. If Scene and Script Disagree, Stop and Resolve It
When a scene transform and a script variable define different values for the same object, treat that as a critical conflict.
Resolve it before doing anything else.

## 15. Think Like a Debugger, Not a Guesser
Your job is not to "make something happen."
Your job is to identify:
- What is controlling the behavior
- Why it is wrong
- What conflicting logic exists
- What the cleanest fix is

---

*Last updated: 2026-04-07*
