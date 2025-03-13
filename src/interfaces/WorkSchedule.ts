export interface WorkSchedules {
  idUser: string | null;
  month: string | null;
  createDate: string | null;
  workSchedule: WorkScheduleDetail[] | null;
  approve: boolean;
}

export interface WorkScheduleDetail {
  workday: string | null;
  workingDayInfo: WorkingDayInfo[];
}

export interface WorkingDayInfo {
  shift: string | null;
  status: string | null;
  note: string;
}
