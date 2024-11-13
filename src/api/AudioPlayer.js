import React from 'react';

export default function AudioPlayer({ src }) {
  return (
    <audio controls>
      <source src={src} type="audio/mpeg" />
      您的瀏覽器不支援音頻元素。
    </audio>
  );
}