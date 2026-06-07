import z from 'zod';

export const UpdateMusicProjectMemberValidation = z.object({
  permission: z.enum(['read', 'edit', 'admin']).optional(),
  projectRoles: z.array(z.string().max(50)).max(10).optional(),
});

export const CreateMusicProjectMemberValidation = z.object({
  userId: z.string().min(1),
  permission: z.enum(['read', 'edit', 'admin']).optional(),
  projectRoles: z.array(z.string().max(50)).max(10).optional(),
});

export type UpdateMusicProjectMemberInput = z.infer<typeof UpdateMusicProjectMemberValidation>;
export type CreateMusicProjectMemberInput = z.infer<typeof CreateMusicProjectMemberValidation>;
