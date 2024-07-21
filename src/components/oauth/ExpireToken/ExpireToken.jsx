import React from "react";

function ExpireToken({ getToken }) {
  return (
    <>
      <button className="expire-token--btn" onClick={getToken}>
        Expire Token
      </button>
    </>
  )
};

export default ExpireToken;