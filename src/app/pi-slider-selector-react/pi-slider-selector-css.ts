import { css } from '@emotion/css';

const fontSize2 = '14px';
const fontSize4='18px';
const unitPx = (value: number = 1) => value * 4 + 'px';

const sliderHandleSize = unitPx(3.5);
const sliderSize = unitPx(3);
const sliderMargin = `${unitPx(2.5)} ${unitPx(1.5)}`;
const sliderPadding = `${unitPx()} 0`;
const dotSize=`${unitPx(2)}`;
const sliderRailHeight=unitPx();
const primaryWhite = '#9c9ea1';
const handleTitleBG='rgba(0,0,0,0.75)';

export const cursor = css`
  cursor: url('/assets/cursors/Hand.cur'), pointer !important;
`;
export const cursorNotAllowed = css`
  cursor: url('/assets/cursors/No.cur'), not-allowed !important;
`;
const piSliderRailAndTrack = css`
  position: absolute;
  height: ${sliderRailHeight};
  border-radius: 2px;
  transition: background-color 0.3s;
  z-index: 3;
`;
export const piSlider = css`
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.85);
  font-size: ${fontSize2};
  font-variant: tabular-nums;
  line-height: 1.5715;
  list-style: none;
  font-feature-settings: 'tnum';
  position: relative;
  height: ${sliderSize};
  margin: ${sliderMargin};
  padding: ${sliderPadding};
  cursor: pointer;
  touch-action: none;
  &:hover {
    .pi-slider-rail {
      background-color: #42444e;
    }
    .pi-slider-track {
      background-color: #a3a3a3;
    }
  }
`;
export const piSliderVertical = css`
  display: inline-block;
  width: 12px;
  height: 100%;
  margin: 6px 10px;
  padding: 0 4px;
  .pi-slider-rail {
    height: 100%;
    width: 4px;
  }
  .pi-slider-handle {
    margin-top: -6px;
    margin-left: -5px;
  }
  .pi-slider-track {
    width: 4px;
    height: unset;
  }
  .pi-slider-step {
    width: 4px;
    height: 100%;
    .pi-slider-mark {
      top: 0;
      left: 12px;
      width: 18px;
      height: 100%;
    }
  }
  .pi-slider-mark-text {
    left: 4px;
    white-space: nowrap;
  }
  .pi-slider-dot {
    top: auto;
    left: 2px;
    margin-bottom: -4px;
  }
  .pi-slider-reverse {
    .pi-slider-step {
      .pi-slider-dot,
      .pi-slider-dot:first-child,
      .pi-slider-dot:last-child {
        margin-top: -4px;
      }
    }
    .pi-slider-handle {
      margin-top: unset;
    }
  }
`;
export const piSliderDisabled = css`
  ${cursorNotAllowed}
  .pi-slider-track,
  .pi-slider-dot,
  .pi-slider-handle,
  .pi-slider-mark-text {
    ${cursorNotAllowed}
  }
`;
export const piSliderRail = css`
  width: 100%;
  background-color: #242424;
  ${piSliderRailAndTrack}
`;
export const piSliderTrack = css`
  background-color: #717171;
  &:focus {
    border-color: #9c9ea1;
    outline: none;
    box-shadow: 0 0 0 3px rgb(47 48 55 / 24%);
  }
  ${piSliderRailAndTrack}
`;
export const piSliderHandle = css`
  position: absolute;
  width: ${sliderHandleSize};
  height: ${sliderHandleSize};
  border-radius: 50%;
  border: solid 2px ${primaryWhite};
  margin-top: -5px;
  background-color: #222;
  z-index: 4;
  box-shadow: 0 0 4px ${primaryWhite};
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.6s,
    transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  &:focus {
    border-color: ${primaryWhite};
    outline: none;
    box-shadow: 0 0 0 5px rgba(47, 48, 55, 0.12);
    z-index: 6;
  }
`;
export const handleTitle=css`
position: absolute;
bottom: 0;
min-width: 30px;
min-height: 32px;
padding: 6px 8px;
color: #fff;
text-align: center;
text-decoration: none;
word-wrap: break-word;
background-color: ${handleTitleBG};
border-radius: 2px;
transition: opacity ease-in-out;
.pi-tooltip-arrow {
  position: absolute;
  display: inline-block;
  width: 13px;
  height: 13px;
  overflow: hidden;
  pointer-events: none;
  left: 50%;
  transform: translate(-50%, 0%);
}
.tooltip-arrow-content {
  position: absolute;
  display: inline-block;
  width: 5px;
  height: 5px;
  overflow: hidden;
  background: ${handleTitleBG};
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(45deg);
  left: 50%;
  transform-origin: center center;
}`;
export const handleTitlePlacementTop=css`
transform: translate(-50%, -50%);
left: 5px;
.pi-tooltip-arrow {
  top: 100%;
}`;
export const handleTitlePlacementBottom=css`
transform: translate(-50%, 50%);
left: 5px;
top: 2px;

.pi-tooltip-arrow {
  bottom: 100%;
}
.tooltip-arrow-content {
  transform: translate(-50%, 50%) rotate(45deg);
  bottom: 0;
}
`;
export const handleTitlePlacementRight=css`

transform: translate(50%, -50%);
left: 2px;
top: 4px;

.pi-tooltip-arrow {
  // bottom: 100%;
  left: 0;
  transform: translate(-100%, 4px) rotate(90deg);
}
`;
export const handleTitlePlacementLeft=css`

transform: translate(-50%, -50%);
right: 2px;
top: 4px;

.pi-tooltip-arrow {
  // bottom: 100%;
  right: 0;
  left: unset;
  transform: translate(100%, 4px) rotate(-90deg);
}
`;
export const piSliderReverse=css`

.pi-slider-step {
  .pi-slider-dot,
  .pi-slider-dot:first-child,
  .pi-slider-dot:last-child {
    margin-right: -4px;
  }
}
`;
export const piSliderStep=css`

  width: 100%;
  height: ${unitPx()};
  position: absolute;
  background: transparent;

  .pi-slider-dot,
  .pi-slider-dot:first-child,
  .pi-slider-dot:last-child {
    margin-left: -4px;
  }
  .pi-slider-dot {
    position: absolute;
    top: -2px;
    width: ${dotSize};
    height:${dotSize};
    background-color: white;
    border: 2px solid #f0f0f0;
    border-radius: 50%;
    cursor: pointer;
    z-index: 3;
  }

  .pi-slider-dot-active {
    border-color: #9c9ea1;
  }
  .pi-slider-mark {
    position: absolute;
    top:${sliderSize};
    left: 0;
    width: 100%;
    font-size: ${fontSize4};
    .pi-slider-mark-text {
      position: absolute;
      display: inline-block;
      color: ${primaryWhite};
      text-align: center;
      word-break: keep-all;
      cursor: pointer;
      user-select: none;
    }
`;
