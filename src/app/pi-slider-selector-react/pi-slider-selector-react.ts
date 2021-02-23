import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { css, cx } from '@emotion/css';
import * as c from './pi-slider-selector-css';
import {
  initSlider,
  PiSlider,
  PiSliderDataInputType,
  SliderMark,
  SliderStyleType,
} from './pi-slider-selector-data';
import * as L from 'lodash';
import {
  createSliderStyle,
  judgePiDataValid,
} from './pi-slider-selector-logic';

const $E = React.createElement;

export function PiSliderSelector(
  e: HTMLElement,
  piData: Observable<PiSliderDataInputType>
) {
  ReactDOM.render(
    $E(() => {
      // const piData$ =
       useObservable(() =>
        piData.pipe(
          tap((value) => {
            judgePiDataValid(value);
            setPiSlider(
              piSlider.setSlider({ ...piSlider, ...value }, piSlider)
            );

            setSliderStyle(
              createSliderStyle(
                piSlider.piVertical,
                piSlider.piReverse,
                piSlider.piMin,
                piSlider.piMax,
                piSlider.piModel,
                piSlider.piMarks,
                piSlider.piValidRange
              )
            );
          })
        )
      );
      const [piSlider, setPiSlider] = useState<PiSlider>(PiSlider(initSlider));
      const [sliderStyle, setSliderStyle] = useState<{
        track: object;
        handle: object[];
        marks: SliderMark[];
      }>(createSliderStyle(
                piSlider.piVertical,
                piSlider.piReverse,
                piSlider.piMin,
                piSlider.piMax,
                piSlider.piModel,
                piSlider.piMarks,
                piSlider.piValidRange
              ));
      console.log(piSlider,sliderStyle);
      return PiSliderSelectorWrapper(piSlider, sliderStyle);
    }),
    e
  );
}
function PiSliderSelectorWrapper(
  piSlider: PiSlider,
  sliderStyle: SliderStyleType
) {
  // const piRail = $E('div', {
  //   key: 'pi-slider-rail',
  //   piname: 'pi-slider-rail',
  //   className: 'pi-slider-rail ' + css(c.piSliderRail),
  // });

  const piSliderReverse = piControlReverseSlider(piSlider, sliderStyle);
  return $E(
    'div',
    {
      key: 'pi-slider-wrapper',
      piname: 'pi-slider-wrapper',
      className: `pi-slider ${
        piSlider.piVertical ? 'pi-slider-vertical' : ''
      } ${piSlider.piDisabled ? 'pi-slider-disabled' : ''} ${cx(
        c.piSlider,
        c.cursor,
        piSlider.piVertical ? c.piSliderVertical : '',
        piSlider.piDisabled ? c.piSliderDisabled : ''
      )}`,
    },
    [piSliderReverse]
  );
}
function piControlReverseSlider(
  piSlider: PiSlider,
  sliderStyle: SliderStyleType
) {
  const piSliderRail = $E('div', {
    key: 'pi-slider-rail',
    piname: 'pi-slider-rail',
    className: `pi-slider-rail ${cx(c.piSliderRail)}`,
  });
  console.log(c.piSliderRail);
  const piSliderTrack = $E('div', {
    key: 'pi-slider-track',
    piname: 'pi-slider-track',
    tabIndex: 0,
    className: `pi-slider-track  ${cx(c.piSliderTrack, c.cursor)}`,
    style: sliderStyle.track,
  });
  const handleGroup = sliderStyle.handle.map((h, i) =>
    PiSliderHandle(h, i, piSlider, sliderStyle.marks)
  );

  const piSliderStep = PiSliderStep(sliderStyle.marks);

  return $E(
    'div',
    {
      key: 'pi-control-reverse-slider',
      piname: 'pi-control-reverse-slider',
      className: piSlider.piReverse
        ? `pi-slider-reverse ${cx(c.piSliderReverse)}`
        : '',
    },
    [piSliderRail, piSliderTrack, handleGroup,piSliderStep]
  );
}
function PiSliderHandle(
  handle: object,
  index: number,
  piSlider: PiSlider,
  marks: SliderMark[]
) {
  const [showHandleTooltip, setShowHandleTooltip] = useState<boolean>(false); //TODO:
  const tooltipArrowContent = $E('div', {
    key: 'tooltip-arrow-content' + index,
    className: 'tooltip-arrow-content',
  });
  const piTooltipArrow = $E(
    'div',
    {
      key: 'pi-tooltip-arrow' + index,
      className: 'pi-tooltip-arrow',
    },
    tooltipArrowContent
  );
  const handleTitle = $E(
    'div',
    {
      key: 'handle-title' + index,
      className: `handle-title handle-title-placement-${
        piSlider.piTooltipPlacement
      } ${cx(
        c.handleTitle,
        c[`handle-title-placement-${piSlider.piTooltipPlacement}`]
      )}`,
      hidden:
        piSlider.piTooltipVisible !== 'always' &&
        (piSlider.piTooltipVisible === 'never' || !showHandleTooltip),
    },
    [L.round(handle['value'], 2), piTooltipArrow]
  );
  return $E(
    'div',
    {
      key: 'pi-slider-handle' + index,
      className: `pi-slider-handle ${cx(c.cursor, c.piSliderHandle)}`,
      tabIndex: 0,
      style: handle['style'],
    },
    handleTitle
  );
}
function PiSliderStep(sliderMarks: SliderMark[]) {
  const piSliderDots = sliderMarks.map((mark, index) => PiSliderDot(mark, index));
  const marks = sliderMarks.map((mark, index) => PiSliderMarkText(mark, index));
  const piSliderMark = $E('div', {
    key: `pi-slider-mark`,
    piname: `pi-slider-mark`,
    className: `pi-slider-mark `,
  },marks);
  return $E(
    'div',
    {
      key: 'pi-slider-step',
      className: `pi-slider-step ${cx(c.piSliderStep)}`,
    },
    [piSliderDots, piSliderMark]
  );
}
function PiSliderDot(markData: SliderMark, index: number) {
  return $E('div', {
    key: 'pi-slider-dot' + index,
    className: `pi-slider-dot ${
      markData.isActive ? 'pi-slider-dot-active ' : ''
    } ${c.cursor}`,
    style: markData.dot,
  });
}
function PiSliderMarkText(mark: SliderMark, index: number) {
  function createHTML(label:string|HTMLElement){

  return {__html: label};
  }
  return $E('span', {
    key: `pi-slider-mark-text-${index}`,
    piname: `pi-slider-mark-text-${index}`,
    className: `pi-slider-mark-text ${c.cursor}`,
    style:mark.mark,
    dangerouslySetInnerHTML:createHTML(mark.label)
  });
}
