import * as yup from "yup";

export const USER_BIO_INFO_SCHEMA = yup.object({
  first_name: yup
    .string()
    .min(3, "First name must be 3 characters or more")
    .required("First name is required"),
  last_name: yup
    .string()
    .min(3, "Last name must be 3 characters or more")
    .required("Last name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
});

export type UserBioInfoInput = yup.InferType<typeof USER_BIO_INFO_SCHEMA>;

export const USER_TYPE_AND_ROLE_REF_SCHEMA = yup.object({
  user_type_ref: yup.string().required("Please select a valid user type"),
  role_ref: yup.string().required("Please select a valid role"),
  auth_policy_ref: yup.string().required("Please select an auth policy"),
});

export type UserTypeAndRoleRefInput = yup.InferType<
  typeof USER_TYPE_AND_ROLE_REF_SCHEMA
>;

export const CREATE_ROLE_SCHEMA = yup.object({
  name: yup.string().required("Role name is required"),
  description: yup.string().optional(),
  portal_login: yup.bool().default(true),
  code: yup.string(),
  permissions: yup
    .array(yup.string().required())
    .min(1, "At least one permission must be attached to this role")
    .required("Please select resources and permissions for this role"),
  user_types: yup
    .array(yup.string().required())
    .min(1, "At least user type must be attached to this role")
    .required("Please select a user type for this role"),
});

export type CreateRoleInput = yup.InferType<typeof CREATE_ROLE_SCHEMA>;
