import { R, createModel } from "use-model-validation";

export default createModel({
  rules: {
    email: [R.required("Email is required"), R.email("Email is invalid")],
  },
});
