import * as yup from "yup";

export const LOGIN_SCHEMA = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email address is required"),

  password: yup.string().required("Password is required"),
});

export type LoginInput = yup.InferType<typeof LOGIN_SCHEMA>;

export const ROLE_SCHEMA = yup.object({
  name: yup
    .string()
    .min(6, "Role name must be 6 characters or more")
    .required("Role name is required"),
  description: yup
    .string()
    .min(6, "Role description must be 6 characters or more")
    .required("Role description is required"),
  permissions: yup.array(),
  portal_login: yup.bool().default(true),
  user_types: yup.array(),
  code: yup.string(),
});

export type RoleInput = yup.InferType<typeof ROLE_SCHEMA>;

export const CUSTOMER_SCHEMA = yup.object({
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
    .email("Enter a valid email address")
    .required("Email address is required"),
  user_type_ref: yup.string().required(),
  auth_policy_ref: yup
    .string()
    .required("Please select an authentication policy"),
  role_ref: yup.string().required("Please select a role"),
});

export type CreateUserInput = yup.InferType<typeof CUSTOMER_SCHEMA>;

export const RESET_PASSWORD_SCHEMA = yup.object({
  password: yup.string().required("Password is required"),
  password_confirmation: yup
    .string()
    .required("Password Confirmation is required")
    .oneOf(
      [yup.ref("password")],
      "Password confirmation must match password entered above"
    ),
  token: yup.string().required("Enter a valid token"),
});

export type ResetPasswordInput = yup.InferType<typeof RESET_PASSWORD_SCHEMA>;

export const FORGOT_PASSWORD_SCHEMA = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required"),
});

export type ForgotPasswordInput = yup.InferType<typeof FORGOT_PASSWORD_SCHEMA>;

export const VERIFY_OTP_CODE_SCHEMA = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required"),
  enteredOTP: yup
    .string()
    .min(6, "Entered OTP code must have at least 6 characters")
    .required("OPT code is required"),
});
export type VerifyOtpCodeInput = yup.InferType<typeof VERIFY_OTP_CODE_SCHEMA>;

export const PHONE_NUMBER_SCHEMA = yup.object({
  phone: yup.string().required().min(9, "Phone must have at least 9 values"),
  mobile: yup
    .string()
    .required()
    .min(11, "Mobile must have at least 11 values"),
  code: yup
    .object({
      calling_code: yup.string().required().min(1),
      country_code: yup.string().required().min(1),
    })
    .required(),
});

export type PhoneNumberItem = yup.InferType<typeof PHONE_NUMBER_SCHEMA>;
