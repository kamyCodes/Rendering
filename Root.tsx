import React from 'react';
import {Composition} from 'remotion';
import {InternetFacts, TOTAL_FRAMES} from './Video';

export const Root: React.FC = () => {
  return (
    <Composition
      id="InternetFacts"
      component={InternetFacts}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
