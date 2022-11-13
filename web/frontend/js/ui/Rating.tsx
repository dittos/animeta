import React from "react";
import MuiRating from "@mui/material/Rating";

type Props = {
  defaultValue?: number;
  disabled?: boolean;
  readOnly?: boolean;
  value?: number | null;
  onChange?: (event: React.SyntheticEvent, value: number | null) => void;
}

export function Rating(props: Props) {
  return <MuiRating
    precision={0.5}
    {...props}
  />
}
