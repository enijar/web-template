import React from "react";
import * as Email from "@react-email/components";

type Props = Readonly<{
  url: string;
  token: string;
}>;

export default function PasswordReset(props: Props) {
  return (
    <Email.Html>
      <Email.Body>
        <Email.Heading>Password Reset</Email.Heading>
        <Email.Text>Click the link below to reset your password</Email.Text>
        <Email.Button href={`${props.url}/reset-password?token=${props.token}`}>Reset password</Email.Button>
      </Email.Body>
    </Email.Html>
  );
}
