import { User } from "./models";

export type TokenItem = {
  token: string;
  expires: string;
};

export type Tokens = {
  access: TokenItem;
  refresh: TokenItem;
};

export interface CreatedBy {
  id: string;
  name: string;
}

export type LoginResponse = {
  user: User;
  tokens: Tokens;
  password_status: PasswordStatus[];
};

export interface Permission {
  _id: string;
  code: string;
  __v: number;
  createdAt: string;
  group: string;
  name: string;
  rec_status: string;
  rec_status_code: number;
  updatedAt: string;
  user_types: string[];
}

export interface PermissionGrouped {
  _id: string;
  code: string;
  name: string;
  group: string;
  permissions: string[];
  user_types: string[];
  rec_status: string;
  rec_status_code: number;
  createdAt: string;
  updatedAt: string;
}

interface UserTypeDet {
  _id: string;
  code: string;
  user_type_system_ref: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Role {
  _id: string;
  code: string;
  role_system_ref: string;
  name: string;
  description: string;
  portal_login: boolean;
  user_types: string[];
  rec_status: string;
  status: string;
  auth_status: string;
  rec_status_code: number;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
  user_types_det: UserTypeDet[];
}

export interface PasswordPolicy {
  expiry_duration: string | number;
  length: {
    min: string | number;
    max: string | number;
  };
  complexity: string[];
  regex: string;
}
export interface AuthPolicy {
  _id: string;
  auth_policy_system_ref: string;
  name: string;
  code: string;
  password_policy: PasswordPolicy;
  otp_required?: boolean;
  description: string;
  status: string;
  rec_status: string;
  auth_status: string;
  rec_status_code: number;
  createdAt: string;
  updatedAt: string;
}

export type UserType = {
  _id: string;
  code: string;
  user_type_system_ref: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type PasswordStatus = {
  is_expired: boolean;
  expires: number;
};

export type VerifyOtpResponse = {
  is_valid: boolean;
};

export type SendEmailOTPResponse = {
  msg: string;
};

export interface OtpUser {
  email: string;
}
