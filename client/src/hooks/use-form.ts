import React from "react";
import { Model } from "use-model-validation/build/types";

type FormElement = HTMLInputElement | HTMLTextAreaElement;

type FormData = {
  [name: string]: any;
};

type Errors = Pick<FormData, string>;

type Form<Data> = {
  data: Partial<Data>;
  setData: React.Dispatch<React.SetStateAction<Partial<Data>>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  reset: () => void;
  onChange: (event: React.ChangeEvent<FormElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
};

type Props<Data> = {
  initialData?: Data;
  onChange?: (form: Form<Data>) => void;
  onSubmit?: (form: Form<Data>) => void;
  model?: Model;
};

const DEFAULT_INITIAL_DATA = {};

export default function useForm<Data extends FormData>({
  initialData = DEFAULT_INITIAL_DATA as Data,
  onChange,
  onSubmit,
  model,
}: Props<Data> = {}): Form<Data> {
  const [data, setData] = React.useState<Partial<Data>>(initialData);
  const [errors, setErrors] = React.useState<Errors>(initialData);

  const reset = React.useCallback(() => {
    setData(initialData ?? DEFAULT_INITIAL_DATA);
  }, [initialData]);

  const formRef = React.useRef<Form<Data>>({
    data,
    setData,
    errors,
    setErrors,
    reset,
    onChange() {},
    onSubmit() {},
  });

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<FormElement>) => {
      const { name } = event.target;

      let value: any = undefined;

      if (event.target.nodeName === "INPUT") {
        const element = event.target as HTMLInputElement;
        switch (event.target.type) {
          case "checkbox":
            value = element.checked;
            break;
          default:
            value = element.value;
            break;
        }
      }

      if (event.target.nodeName === "TEXTAREA") {
        const element = event.target as HTMLTextAreaElement;
        value = element.value;
      }

      setData((data) => {
        return { ...data, [name]: value };
      });
    },
    []
  );

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!model) {
        if (onSubmit) onSubmit(formRef.current);
        return;
      }
      const { errors, valid } = model.fresh(formRef.current.data).validate();
      setErrors(errors);
      if (valid && onSubmit) onSubmit(formRef.current);
    },
    [onSubmit, model]
  );

  React.useEffect(() => {
    formRef.current.onChange = handleChange;
    formRef.current.onSubmit = handleSubmit;
  }, [handleChange, handleSubmit]);

  React.useEffect(() => {
    if (onChange) onChange(formRef.current);
  }, [onChange]);

  return React.useMemo<Form<Data>>(() => {
    const form = {
      data,
      setData,
      errors,
      setErrors,
      reset,
      onChange: handleChange,
      onSubmit: handleSubmit,
    };
    formRef.current = form;
    return form;
  }, [data, errors, reset, handleChange, handleSubmit]);
}
