import React from "react";
import { initiateCallback } from "/src/firebase.js";

function Callback() {

  React.useEffect(() => {
    initiateCallback();
  }, [])

  return (
    <>
    </>
  )
};

export default Callback;