import { PropsWithChildren, createContext, useContext, useState } from "react";

import { UserCreationStage, WorkflowContextOptions } from "./types";
import { CreateUserInput } from "@/lib/validations/auth-validations";

const WorkflowContext = createContext<WorkflowContextOptions | null>(null);

export const WorkflowContextProvider = ({ children }: PropsWithChildren) => {
  const [create_user_input, updateCreateUserInput] = useState<
    Partial<CreateUserInput>
  >({});
  const [create_user_welcome_disabled, setCreateUserWelcomeDisabled] =
    useState<boolean>(false);
  const [create_user_stage, updateCreateUserStage] =
    useState<UserCreationStage>(UserCreationStage.welcome);

  return (
    <WorkflowContext.Provider
      value={{
        create_user_input,
        updateCreateUserInput,
        create_user_stage,
        updateCreateUserStage,
        create_user_welcome_disabled,
        disableUserWelcome: () => setCreateUserWelcomeDisabled(true),
        onReset: (enable_welcome = false) => {
          updateCreateUserInput({});
          updateCreateUserStage(UserCreationStage.bio_information);

          if (enable_welcome) {
            setCreateUserWelcomeDisabled(false);
            updateCreateUserStage(UserCreationStage.welcome);
          }
        },
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflowContext = () => {
  const ctx = useContext(WorkflowContext) as WorkflowContextOptions;
  return ctx;
};
