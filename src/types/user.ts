export type LocationOption = 'boa_viagem' | 'poco_da_panela';
export type ClinicTypeOption = 'esportivo' | 'ambulatorio';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  location: LocationOption;
  workStartTime: string; // Ex: "08:00"
  workEndTime: string; // Ex: "17:00"
  clinicType: ClinicTypeOption;
  createdAt: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  location: LocationOption;
  workStartTime: string;
  workEndTime: string;
  clinicType: ClinicTypeOption;
}
