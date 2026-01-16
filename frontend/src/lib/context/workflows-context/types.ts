import { CreateUserInput } from "@/lib/validations/auth-validations";

export enum UserCreationStage {
  welcome = "welcome",
  bio_information = "bio_information",
  role_selection = "role_selection",
  confirmation = "confirmation",
}

export type WorkflowContextOptions = {
  // User Creation
  create_user_welcome_disabled: boolean;
  create_user_stage: UserCreationStage;
  create_user_input: Partial<CreateUserInput>;
  disableUserWelcome: () => void;
  updateCreateUserStage: (stage: UserCreationStage) => void;
  updateCreateUserInput: (data: Partial<CreateUserInput>) => void;
  onReset: (enable_welcome?: boolean) => void;
};
