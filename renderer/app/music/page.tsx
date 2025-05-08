"use client";

import { useSonosState } from "@components/providers/SonosContext";
import React from "react";


const MusicHomePage = () => {
  const state = useSonosState();
  return <pre>{JSON.stringify(state, null, 2)}</pre>
};


export default MusicHomePage;
