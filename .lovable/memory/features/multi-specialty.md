---
name: Multi-specialty architecture
description: Platform supports multiple specialties per user; odontología is phase 1
type: feature
---
- Tables: `specialties` (catalog), `user_specialties` (many-to-many assignment)
- `src/lib/specialties.ts` maps specialty codes → clinical modules
- AuthContext exposes `specialties` and `specialtyCodes`
- Sidebar filters clinical items by user's active specialties (admins see all)
- CompleteProfile includes specialty checkbox selection
- Phase 1: only "odontologia" seeded and functional
- Future specialties: add row to specialties table + entry in SPECIALTY_MODULES map
