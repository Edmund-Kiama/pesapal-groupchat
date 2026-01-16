# Groups Fixes - TODO List

## Backend Updates
- [x] Update `getMemberships` in `backend/controllers/group.controller.js` to include member count and creator ID
- [x] Add `deleteGroup` endpoint in `backend/controllers/group.controller.js`
- [x] Add delete route in `backend/router/group.route.js`

## Frontend Updates
- [x] Update `frontend/src/components/groups/group-list.tsx` - pass creatorId and memberCount to GroupCard
- [x] Update `frontend/src/components/groups/group-card.tsx` - add Delete button logic for group creator
- [x] Update `frontend/src/lib/typings/models.ts` - add memberCount property to Group interface
- [x] Add `deleteGroup` API method in `frontend/src/lib/api/groups-api.ts`
- [x] Update `frontend/src/app/groups/page.tsx` - handle delete action and show feedback messages

## All tasks completed!



