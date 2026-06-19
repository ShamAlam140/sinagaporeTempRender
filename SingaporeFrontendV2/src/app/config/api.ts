import { environment } from 'src/environments/environment';

export const baseUrl = environment.apiUrl;

export const employeeLoginUrl = `${baseUrl}/employee/login`;
export const managerLoginUrl = `${baseUrl}/manager/login`;
export const otpUrl = `${baseUrl}/otp`;
export const superadminLoginUrl = `${baseUrl}/superadmin/login`;
export const coveringEmpUrl = `${baseUrl}/coveringEmp`;
