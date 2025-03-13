import { createSlice } from "@reduxjs/toolkit";
import { FacultyModelQuery } from "../../interfaces/Faculty";
import { SelectResponseBase } from "../../interfaces/SelectBase";
import { HRRepository } from "../../services/RepositoryBase";

interface FacultyState {
  faculties: FacultyModelQuery[];
  facultieGetSelect: SelectResponseBase[];
  loading: boolean;
  error: string | null;
}

const repository = new HRRepository();

const initialState: FacultyState = {
  faculties: [],
  facultieGetSelect: [],
  loading: false,
  error: null,
};

export const facultySlice = createSlice({
  name: "faculty",
  initialState,
  reducers: {
    fetchFaculties: (state) => {
      state.loading = true;
    },
    fetchFacultiesSuccess: (state, action) => {
      state.faculties = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchFacultiesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createFaculty: (state, action) => {
      state.loading = true;
    },
    createFacultySuccess: (state, action) => {
      state.faculties.push(action.payload);
      state.loading = false;
      state.error = null;
    },
  },
});
