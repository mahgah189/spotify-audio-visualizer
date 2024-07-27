import React from "react";

function PlaybackControls(props) {
  return (
    <>
      <button
        className="playback-controls--prev-track"
        onClick={() => props.player.previousTrack()}
      >
        Previous track
      </button>
      <button
        className="playback-controls--toggle-play"
        onClick={() => props.player.togglePlay()}
      >
        {props.isPaused ? "PLAY" : "PAUSE"}
      </button>
      <button
        className="playback-controls--next-track"
        onClick={() => props.player.nextTrack()}
      >
        Next track
      </button>
    </>
  )
};

export default PlaybackControls;