import { MRT_PaginationState } from "mantine-react-table";

export interface PaginationResponseBase<T> {
  lists: T[];
  count: number;
}

export const paginationBase: MRT_PaginationState = {
  pageIndex: 0,
  pageSize: 50,
};
