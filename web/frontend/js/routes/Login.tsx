import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import LoginDialog from "../ui/LoginDialog";

export default AppLayout.wrap({
  component: () => <LoginDialog next="/" />,
  load: async () => ({}),
  renderTitle: () => '로그인',
});
