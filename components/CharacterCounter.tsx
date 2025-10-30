
import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max }) => {
  return (
    <div className="text-right text-xs text-gray-500 mt-1 pr-1">
      {current} / {max}
    </div>
  );
};

export default CharacterCounter;
