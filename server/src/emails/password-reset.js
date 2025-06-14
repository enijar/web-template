import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Email from "@react-email/components";
export default function PasswordReset(props) {
    return (_jsx(Email.Html, { children: _jsxs(Email.Body, { children: [_jsx(Email.Heading, { children: "Password Reset" }), _jsx(Email.Text, { children: "Click the link below to reset your password" }), _jsx(Email.Button, { href: `${props.url}/reset-password?token=${props.token}`, children: "Reset password" })] }) }));
}
