import { R, createModel } from "use-model-validation";

export default createModel({
  rules: {
    email: [R.required("Enter your email"), R.email("Invalid email")],
    password: [R.required("Enter your password")],
    passwordConfirmation: [
      R.required("Confirm your password"),
      R.test((data: any) => {
        return data.password === data.passwordConfirmation;
      }, "Passwords don't match"),
    ],
  },
});
