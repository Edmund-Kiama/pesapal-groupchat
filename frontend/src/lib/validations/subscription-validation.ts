import * as yup from "yup";

export enum SubscriptionType {
  custom = "custom",
  standard = "standard",
}

export enum SubscriptionCycleType {
  recurring = "recurring",
  one_time = "one-time",
}

export enum SubscriptionPeriod {
  days = "D",
  months = "M",
  years = "Y",
}

export const DURATION_SCHEMA = yup.object({
  period: yup
    .string()
    .oneOf([
      SubscriptionPeriod.days,
      SubscriptionPeriod.months,
      SubscriptionPeriod.years,
    ])
    .optional(),
  length: yup.number().optional(),
});

export const FEATURE_SCHEMA = yup.object({
  name: yup.string(),
  // description: yup.string(),
  bill_type_ref: yup.string().required("Bill type is required"),
  // billing_cycle_ref: yup.string().required("Billing cycle is required"),
  price_per_bill: yup.object({
    amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(0, "Amount cannot be negative"),
    currency_ref: yup.string().required("Currency is required"),
    // cost_by_customer: yup.bool().default(false),
    term: DURATION_SCHEMA.optional(),
  }),
  // bill_processed_on: yup.number().required("Bill processed on is required"),
});

export const BILLING_TENURE_SCHEMA = yup.object({
  grace_period: yup.number().required("Grace period is required"),
  trial_period_duration: yup
    .number()
    .required("Trial period duration is required"),
});

export const INFORMATION_SCHEMA = yup.object({
  name: yup.string().required(),
  type: yup
    .string()
    .oneOf([SubscriptionType.custom, SubscriptionType.standard])
    .optional(),
  description: yup.string().required(),
  country_ref: yup.string(),
  currency_ref: yup.string(),
  currency_code: yup.string(),
  cycle_type: yup
    .string()
    .oneOf([SubscriptionCycleType.one_time, SubscriptionCycleType.recurring])
    .optional(),
  client_refs: yup.array().optional(),
  property_refs: yup.array().optional(),
  grace_period: DURATION_SCHEMA.optional(),
  trial_duration: DURATION_SCHEMA.optional(),
  assigned_users: yup.array(),
});

export type SubscriptionInformation = yup.InferType<typeof INFORMATION_SCHEMA>;

export const SUBSCRIPTION_FEATURES = yup.object({
  features: yup.array(FEATURE_SCHEMA.required()).min(1).required(),
});

// Merge schemas dynamically using yup.lazy
export const FULL_INFORMATION_SCHEMA = yup.lazy(() =>
  INFORMATION_SCHEMA.concat(SUBSCRIPTION_FEATURES)
);

// Define type
export type FullSubscriptionInformation = yup.InferType<
  typeof FULL_INFORMATION_SCHEMA
>;

export type SubscriptionFeatureItem = yup.InferType<typeof FEATURE_SCHEMA>;
export type SubscriptionFeatures = yup.InferType<typeof SUBSCRIPTION_FEATURES>;
