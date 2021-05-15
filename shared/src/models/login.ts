import { R, createModel } from "use-model-validation";

export default createModel({
  rules: {
    email: [R.required("Enter your email"), R.email("Invalid email")],
    password: [R.required("Enter your password")],
  },
});
