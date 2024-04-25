import React from "react";

import { DummyComponent } from "./DummyComponent";
import { ReactApplicationV2Mixin } from "./ReactApplicationV2Mixin";

const render = (sheet: foundry.applications.api.ApplicationV2) => {
  return <DummyComponent>Hey from mixed in code</DummyComponent>;
};

export const DummyAppV2WithMixin = ReactApplicationV2Mixin(
  "DummyAppV2WithMixin",
  foundry.applications.api.ApplicationV2,
  render,
);
