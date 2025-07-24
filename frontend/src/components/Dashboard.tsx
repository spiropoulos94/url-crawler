import React from "react";
import { AddURL } from "./AddURL";
import { URLTable } from "./URLTable";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      <AddURL />
      <URLTable />
    </div>
  );
};
