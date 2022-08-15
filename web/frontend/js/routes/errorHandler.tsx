import React from "react";
import { ClientSideErrorHandler } from "nuri/client/view";
import { CenteredFullWidth } from "../ui/Layout";

export const errorHandler: ClientSideErrorHandler = {
  component: ({ error }) => (
    <CenteredFullWidth>
      <h1>오류가 발생했습니다.</h1>
      <p>페이지 새로 고침 후 다시 시도해보세요.</p>
      
      <pre>{error.toString()}</pre>
    </CenteredFullWidth>
  ),
}
