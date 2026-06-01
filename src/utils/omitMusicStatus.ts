export function omitStatus<T extends { status?: string }>(row: T): Omit<T, 'status'> {
  const { status: _status, ...rest } = row;
  return rest;
}

export function omitStatusFromArray<T extends { status?: string }>(rows: T[]): Omit<T, 'status'>[] {
  return rows.map(omitStatus);
}
