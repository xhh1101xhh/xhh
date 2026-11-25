import React from 'react';

/**
 * 全片统一的漆艺材质定义（渐变 + 滤镜）。挂在根节点一次，各 svg 通过 url(#id) 引用。
 * lqObj   漆层倒角 + 漆面高光 + 厚漆投影（器物、道具）
 * lqSoft  轻倒角（人物、大面积物件，开销更低）
 * lqShadow 厚漆投影
 * lqBrush 刷痕纹理（叠加在底色上）
 * dirBlurX 横向动态模糊（甩镜）
 * goldGlow 描金发光
 */
export const LacquerDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8a6424" />
        <stop offset="0.35" stopColor="#f6dc94" />
        <stop offset="0.55" stopColor="#c99a44" />
        <stop offset="0.8" stopColor="#f2d58a" />
        <stop offset="1" stopColor="#7d5a20" />
      </linearGradient>
      <linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7e2a0" />
        <stop offset="0.5" stopColor="#c8963e" />
        <stop offset="1" stopColor="#7a5520" />
      </linearGradient>
      <linearGradient id="zhuLq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c43a2a" />
        <stop offset="1" stopColor="#6e1a12" />
      </linearGradient>
      <linearGradient id="blackLq" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3a3330" />
        <stop offset="0.45" stopColor="#0d0b0a" />
        <stop offset="1" stopColor="#1f1a17" />
      </linearGradient>
      <linearGradient id="mop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#bfe8ff" />
        <stop offset="0.3" stopColor="#f3c8e8" />
        <stop offset="0.55" stopColor="#c6f2dc" />
        <stop offset="0.8" stopColor="#9fc8ff" />
        <stop offset="1" stopColor="#fff2cf" />
      </linearGradient>
      <radialGradient id="fireGlow">
        <stop offset="0" stopColor="#ffd88a" stopOpacity="0.9" />
        <stop offset="0.4" stopColor="#ff8a3a" stopOpacity="0.35" />
        <stop offset="1" stopColor="#ff6a20" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="softWhite">
        <stop offset="0" stopColor="#fff6e2" stopOpacity="0.9" />
        <stop offset="1" stopColor="#fff6e2" stopOpacity="0" />
      </radialGradient>

      <filter id="lqObj" x="-20%" y="-20%" width="140%" height="150%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b" />
        <feSpecularLighting in="b" surfaceScale="5" specularConstant="0.95" specularExponent="26" lightingColor="#fff1d6" result="spec">
          <feDistantLight azimuth="235" elevation="50" />
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
        <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.5" k4="0" result="lit" />
        <feDropShadow in="lit" dx="5" dy="9" stdDeviation="7" floodColor="#000" floodOpacity="0.55" />
      </filter>
      <filter id="lqSoft" x="-15%" y="-15%" width="130%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b" />
        <feSpecularLighting in="b" surfaceScale="3" specularConstant="0.6" specularExponent="18" lightingColor="#ffeccc" result="spec">
          <feDistantLight azimuth="230" elevation="55" />
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
        <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.32" k4="0" result="lit" />
        <feDropShadow in="lit" dx="3" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.45" />
      </filter>
      <filter id="lqShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
      </filter>
      <filter id="lqBrush" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.06" numOctaves="2" seed="7" result="n" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 1.4 -0.55" />
      </filter>
      <filter id="lqGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.35" />
      </filter>
      <filter id="dirBlurX" x="-10%" y="0" width="120%" height="100%">
        <feGaussianBlur stdDeviation="42 0" />
      </filter>
      <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="g" />
        <feMerge>
          <feMergeNode in="g" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="inkEdge" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="11" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="60" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="roughEdge" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="5" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);
