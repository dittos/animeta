import { Client, CompanyDto } from "../../../shared/client";
import { call } from './API';

function create(): Client {
  return {
    async call(path: string, params: any): Promise<any> {
      return call(path, params)
    }
  }
}

export const API = create()

let _companies: Promise<CompanyDto[]> | undefined;

export function getCompanies(cached = true) {
  if (!_companies || !cached) {
    _companies = API.call('/api/admin/v1/getCompanies', {});
  }
  return _companies;
}
