import z from 'zod';

export const RemindersSchema = z.object({
  useDefault: z.boolean(),
  overrides: z.array(
    z.object({
      method: z.enum(['email', 'popup']),
      minutes: z.number().int().min(0),
    }),
  ).max(5),
});

const CalendarEventFieldsSchema = z.object({
  assetId: z.number().int().positive().optional(),
  musicProjectId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  reminders: RemindersSchema.nullable().optional(),
});

function hasExactlyOneScope(data: { assetId?: number; musicProjectId?: number }) {
  const hasAsset = data.assetId != null;
  const hasProject = data.musicProjectId != null;
  return hasAsset !== hasProject;
}

export const CalendarEventValidation = CalendarEventFieldsSchema.refine(
  hasExactlyOneScope,
  { message: 'Either assetId or musicProjectId is required, but not both' },
);

export const UpdateCalendarEventValidation = CalendarEventFieldsSchema.partial().extend({
  id: z.number().int().positive(),
}).refine(
  data => data.assetId === undefined && data.musicProjectId === undefined
    ? true
    : hasExactlyOneScope({ assetId: data.assetId, musicProjectId: data.musicProjectId }),
  { message: 'Either assetId or musicProjectId is required, but not both' },
);

export type CalendarEventInput = z.infer<typeof CalendarEventValidation>;
export type UpdateCalendarEventInput = z.infer<typeof UpdateCalendarEventValidation>;
