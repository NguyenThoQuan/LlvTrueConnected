export interface WorkSchedules {
  id: string;
  idUser: string | null;
  month: string | null;
  monthD: string | null;
  createDate: string | null;
  workSchedule: WorkScheduleDetail[] | null;
  approve: string;
  isEdit: boolean;
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
