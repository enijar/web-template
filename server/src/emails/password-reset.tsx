import React from "react";
import { Button, Html, Body, Text, Heading } from "@react-email/components";

type Props = Readonly<{
  url: string;
  token: string;
}>;

export default function PasswordReset(props: Props) {
  return (
    <Html>
      <Body>
        <Heading>Password Reset</Heading>
        <Text>Click the link below to reset your password</Text>
        <Button href={`${props.url}/reset-password?token=${props.token}`}>Reset password</Button>
      </Body>
    </Html>
  );
}
