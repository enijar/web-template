import React from "react";

type Data = { [key: string]: any };

export default function useForm(model: any, submitted?: (data: Data) => void) {
  const [data, setData] = React.useState<Data>({});
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { type, name, value, checked } = event.target;
      setData((data) => ({
        ...data,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const onSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const { errors, valid } = model.validate();
      setErrors(errors);
      if (valid && submitted) {
        submitted(data);
      }
    },
    [model, submitted, data]
  );

  React.useEffect(() => {
    model.update(data);
  }, [data, model]);

  return { data, setData, errors, setErrors, onChange, onSubmit };
}
