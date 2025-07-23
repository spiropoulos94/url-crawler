import React from "react";
import { AddURL } from "./AddURL";
import { URLTable } from "./URLTable";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <AddURL />
      <URLTable />
    </div>
  );
};