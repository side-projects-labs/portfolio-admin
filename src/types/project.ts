import { type ReactElement } from 'react';
import { type AdminProjectResponse } from '@/docs/api';

export interface ProjectTableData extends AdminProjectResponse {
  buttonGroup?: ReactElement;
}

export interface ProjectDetailResponse {
  status: boolean;
  data?: AdminProjectResponse | null;
}
