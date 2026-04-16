---
name: Role-category permission model
description: Permissions use role category (admin/clinico/operativo) + specialties, not just role name
type: feature
---
- AppRole (DB enum): admin, odontologo, asistente
- RoleCategory: administrativo, clinico, operativo — mapped from AppRole via ROLE_CATEGORY
- Category determines base module + action access
- Clinical modules (clinical, notes, history) are specialty-gated for non-admin categories
- `canEffectivelyAccessModule()` checks category + specialty presence
- AuthContext exposes: roleCategory, isCategory(), canModule(), canSpecialty(), canAction(), canRoute()
- Settings page shows category badges on roles and +ESP tag on specialty-gated modules
- Adding a new clinical role: add to DB enum, map to "clinico" in ROLE_CATEGORY
