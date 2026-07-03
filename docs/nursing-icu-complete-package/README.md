# Nursing ICU Complete Package

This folder is a delivery marker for the complete Nursing / ICU module pushed to Git.

## Runtime Module Paths

- `src/features/nursing-icu/`
- `src/app/(app)/nursing-icu/`
- `src/app/(app)/icu-command-center/`
- `src/data/navigation.ts`

## Included Functional Areas

- ICU command matrix and dashboard workflows
- Admission / bed allocation workflow
- Doctor rounds and daily ICU review
- Orders and care plans workflow
- Medication administration workflow
- Intake / output and fluid balance graph
- Head nurse and ward nurse supervision
- Task creation, assignment, acknowledgement, and escalation
- Shift handover workflow
- Device, signal, analytics, tele-ICU, and command center routes

## Demo Entry Points

- `/nursing-icu`
- `/nursing-icu/arrival-bed-allocation`
- `/nursing-icu/orders-care-plans`
- `/nursing-icu/intake-output`
- `/nursing-icu/intake-output?view=fluid-balance`
- `/icu-command-center`

## Verification

Before this package was pushed, the module was checked with:

- `npx eslint "src/features/nursing-icu/nursing-icu-pages.tsx"`
- `npx eslint "src/features/nursing-icu/components/nursing-icu-workflow.tsx"`
- `npx eslint "src/features/nursing-icu/components/intake-output-workspace.tsx"`
- `npm run typecheck`
- `npm run build`

