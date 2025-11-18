import React from "react";

type Props = {
  children?: React.ReactNode;
  onSubmit(form: { element: HTMLFormElement; data: FormData }): Promise<void> | void;
};

export default function Form(props: Props) {
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const element = event.currentTarget;
        await props.onSubmit({ element, data: new FormData(element) });
      }}
    >
      {props.children}
    </form>
  );
}
