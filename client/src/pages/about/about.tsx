import React from "react";
import { Link } from "react-router-dom";
import { userModel } from "@app/shared";

export default function About() {
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const onSubmit = React.useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const { errors, valid, data } = userModel.validate();
    setErrors(errors);
    if (valid) {
      console.log(data);
    }
  }, []);

  const onChange = React.useCallback((name: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      userModel.update({ [name]: event.target.value });
    };
  }, []);

  return (
    <div>
      <h1>About</h1>

      <div>
        <form onSubmit={onSubmit}>
          <label>
            Email
            <input onChange={onChange("email")} />
          </label>
          {errors?.email}
        </form>
      </div>

      <Link to="/">home</Link>
    </div>
  );
}
