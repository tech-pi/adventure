import {
  limitPositionRangeByHandle,
  limitPositionRangeByTrack,
} from './limit-position-with-base';
import * as L from 'lodash';
import * as R from 'ramda';
export interface SliderStyleType{

    track: object;
    handle: object[];
    marks: SliderMark[];

}
type PiSingleModelType = {
  value: number;
};
type PiRangeModelType = {
  value: number[];
};
export type PiModelType = PiRangeModelType | PiSingleModelType;

export type PiMarkType =
  | {
      [key: number]: string | HTMLElement;
    }
  | {
      [key: number]: { style: object; label: string | HTMLElement };
    };
type PiValidRangeUnitType = {
  value: number;
  style: object;
  label: string | HTMLElement;
};
export type PiValidRangeType = {
  start: PiValidRangeUnitType;
  end: PiValidRangeUnitType;
};
export enum PiTooltipVisibleType {
  Default = 'default',
  Always = 'always',
  Never = 'never',
}
export enum PiTooltipPlacementType {
  Top = 'top',
  Bottom = 'bottom',
  Right = 'right',
  Left = 'left',
}
export enum PiModelTypeName {
  Range = 'range',
  Single = 'single',
}
export type PiLengthBaseType = {
  base: number;
  minMul: number;
};
export interface PiSliderDataExceptPiModel {
  piDisabled: boolean;
  piDots: boolean;
  piValidRange?: PiValidRangeType[];
  piMarks?: PiMarkType;
  piMin: number;
  piMax: number;
  piLengthBase?: PiLengthBaseType;
  piStep: number;
  piReverse: boolean;
  piTipFormatter?: (value: number) => string;
  piVertical: boolean;
  piTooltipVisible: PiTooltipVisibleType;
  piTooltipPlacement: PiTooltipPlacementType;
}
export interface PiSliderData extends PiSliderDataExceptPiModel {
  piModel: PiModelType;
}
export interface SliderMark {
  dot: object;
  mark: object;
  ratio: number;
  isActive: boolean;
  value: number;
  label?: string | HTMLElement;
}
export type RangeHandleDataType = {
  type: 'min' | 'max';
  originModel: number[];
};
export type SingleHandleDataType = {
  type: 'single';
};
export type HandleDataType = RangeHandleDataType | SingleHandleDataType;
export interface PiSlider  extends PiSliderDataExceptPiModel {
  piModel: PiModelWithMatcher;
  readonly setSlider: (
    value: Partial<PiSliderData>,
    piSlider: PiSlider,
  ) => PiSlider;
  readonly freeClick: (
    ratio: number,
    marks: SliderMark[],
    piSlider: PiSlider,
    data?: HandleDataType
  ) => PiSlider;
  readonly dragHandle: (
    offsetX: number,
    length: number,
    piSlider: PiSlider,
    marks: SliderMark[],
    data: HandleDataType
  ) => PiSlider;
  readonly clickRailDot: (
    value: number,
    piSlider: PiSlider,
    data?: HandleDataType
  ) => PiSlider;
  readonly controlHandleByKB: (
    value: number,
    data: HandleDataType,
    piSlider: PiSlider
  ) => PiSlider;
  readonly dragTrack: (moveRatio: number, piSlider: PiSlider) => PiSlider;
  readonly controlTrackByKB: (
    event: KeyboardEvent,
    piSlider: PiSlider
  ) => PiSlider;
}
export interface PiSliderDataInputType {
  piDisabled?: boolean;
  piDots?: boolean;
  piValidRange?: PiValidRangeType[];
  piMarks?: PiMarkType;
  piMin: number;
  piMax: number;
  piModel: PiModelType;
  piLengthBase?: PiLengthBaseType;
  piStep?: number;
  piReverse?: boolean;
  piTipFormatter?: (value: number) => string;
  piVertical?: boolean;
  piTooltipVisible?: PiTooltipVisibleType;
  piTooltipPlacement?: PiTooltipPlacementType;
}

export const initSlider: PiSliderData = {

    piMin: 155,
    piMax: 3150,
    piLengthBase: { base: 5, minMul: 10 },

    piStep: 0.01,
    piModel: {
      type: PiModelTypeName.Range,
      value: [1800, 155],
    } as PiModelType,
    piMarks: {
      155: '155',
      3150: '3150',
    },
  piDisabled: false,
  piDots: false,
  piReverse: false,
  piVertical: false,
  piTooltipVisible: PiTooltipVisibleType.Default,
  piTooltipPlacement: PiTooltipPlacementType.Top,
};

type PiModelMatcher<T> = T & {
  match<T>(partten: PiModelVisitor<T>): T;
};
export type PiModelWithMatcher =
  | PiModelMatcher<PiSingleModelType>
  | PiModelMatcher<PiRangeModelType>;

export interface PiModelVisitor<T> {
  singleHandleModel: (e: PiModelWithMatcher) => T;
  rangeHandleModel: (e: PiModelWithMatcher) => T;
}

export function singleHandleModel(value: number): PiModelWithMatcher {
  const single: PiModelWithMatcher = {
    value,
    match: (partten) => {
      return partten.singleHandleModel(single);
    },
  };
  return single;
}
export function rangeHandleModel(value: number[]): PiModelWithMatcher {
  const range: PiModelWithMatcher = {
    value,
    match: (partten) => {
      return partten.rangeHandleModel(range);
    },
  };
  return range;
}
export function PiSlider(value: PiSliderData): PiSlider {
  function producePiModelWithMatcher(piModel: PiModelType): PiModelWithMatcher {
    return L.isNumber(piModel.value)
      ? singleHandleModel(piModel.value as number)
      : rangeHandleModel(piModel.value as number[]);
  }
  const piSlider: PiSlider = {
    ...value,
    piModel: producePiModelWithMatcher(value.piModel),
    setSlider: (value: Partial<PiSliderData>, piSlider: PiSlider) => {
      if (!L.isNil(value.piModel)) {
        const { piModel, ...data } = value;
        const modelWithMatcher = producePiModelWithMatcher(piModel);
        return { ...piSlider, ...data, piModel: modelWithMatcher };
      }
      const newValue = { ...value } as Partial<PiSliderDataExceptPiModel>;
      return { ...piSlider, ...newValue };
    },
    clickRailDot: (
      value: number,
      piSlider: PiSlider,
      data?: HandleDataType
    ) => {
      if (piSlider.piDisabled || piSlider.piLengthBase) return piSlider;
      //需要在ts中先判断 是否在disabled状态，是否在有效值里
      const piModel = producePiModelWithMatcher(
        piSlider.piModel
      ).match<PiModelWithMatcher>(clickRailDotMatcher(value, piSlider, data));
      return {
        ...piSlider,
        piModel,
      };
    },
    freeClick: (
      ratio: number,
      marks: SliderMark[],
      piSlider: PiSlider,
      data?: HandleDataType
    ) => {
      if (piSlider.piDisabled || piSlider.piLengthBase) return piSlider;
      // if (L.isNil(piSlider.piLengthBase)) {
      if (piSlider.piDots) {
        const marksSorted = marks.sort(
          (a, b) => Math.abs(a.ratio - ratio) - Math.abs(b.ratio - ratio)
        );
        return piSlider.clickRailDot(marksSorted[0].value, piSlider, data);
      } else {
        const ratioValue = (ratio * (piSlider.piMax - piSlider.piMin)) / 100; //点击位置的值
        const res =
          Math.round(
            ratioValue / (R.isNil(piSlider.piStep) ? 1 : piSlider.piStep)
          ) *
            (R.isNil(piSlider.piStep) ? 1 : piSlider.piStep) +
          piSlider.piMin;
        console.log(res, data);
        return piSlider.clickRailDot(res, piSlider, data);
      }
      // } else {
      //   const currValue = (ratio * (piSlider.piMax - piSlider.piMin)) / 100;
      //   const piModel = producePiModelWithMatcher(
      //     piSlider.piModel,
      //   ).match<PiModelWithMatcher>(
      //     freeClickWithBaseMatcher(currValue, piSlider.piMin, piSlider.piLengthBase),
      //   );
      //   return { ...piSlider, piModel };
      // }
    },
    dragHandle: (
      offsetX: number,
      length: number,
      piSlider: PiSlider,
      marks: SliderMark[],
      data: HandleDataType = { type: 'single' }
    ) => {
      if (piSlider.piDisabled) return piSlider;
      console.log('debug base data...', data);
      if (data.type !== 'single') data.originModel.sort((a, b) => a - b);
      console.log('debug base data...', data, piSlider.piReverse);
      if (offsetX < 0) offsetX = 0;
      else if (offsetX > length) offsetX = length;
      const ratio = offsetX / length;
      if (!piSlider.piLengthBase) {
        return piSlider.freeClick(ratio * 100, marks, piSlider, data);
      } else {
        console.log(ratio);
        const currValue =
          ratio * (piSlider.piMax - piSlider.piMin) + piSlider.piMin; //点击位置的值
        console.log('currValue', currValue, piSlider, data);

        const piModel = producePiModelWithMatcher(
          piSlider.piModel
        ).match<PiModelWithMatcher>(
          dragHandleWithBaseMatcher(
            currValue,
            piSlider.piMin,
            piSlider.piMax,
            piSlider.piLengthBase,
            data
          )
        );
        console.log({ ...piSlider, piModel });
        return { ...piSlider, piModel };
      }
    },
    controlHandleByKB: (
      value: number,
      data: HandleDataType,
      piSlider: PiSlider
    ) => {
      if (piSlider.piDisabled) return piSlider;
      if (!piSlider.piLengthBase) {
        if (value < piSlider.piMin) value = piSlider.piMin;
        if (value > piSlider.piMax) value = piSlider.piMax;

        const piModel = producePiModelWithMatcher(
          piSlider.piModel
        ).match<PiModelWithMatcher>(dragHandleByKBMatcher(value, data));
        return {
          ...piSlider,
          piModel,
        };
      }
      console.log(value);
      // if(value<piSlider.piMin+piSlider.piLengthBase) value=piSlider.piMin+piSlider.piLengthBase;
      // if(value>piSlider.piMax) value=limitValueByBase(piSlider.piMax-piSlider.piMin);
      const piModel = producePiModelWithMatcher(
        piSlider.piModel
      ).match<PiModelWithMatcher>(
        dragHandleWithBaseMatcher(
          value,
          piSlider.piMin,
          piSlider.piMax,
          piSlider.piLengthBase,
          data
        )
      );
      console.log(piModel);
      return {
        ...piSlider,
        piModel,
      };
    },
    dragTrack: (moveRatio: number, piSlider: PiSlider) => {
      // let moveValue = moveRatio * (piSlider.piMax - piSlider.piMin);
      // moveValue = Math.round(moveValue / piSlider.piStep) * piSlider.piStep;
      // console.log(moveValue, piSlider.piModel.value);
      // const length = piSlider.piModel.value[1] - piSlider.piModel.value[0];
      // let range = [
      //   piSlider.piModel.value[0] - moveValue,
      //   piSlider.piModel.value[1] - moveValue,
      // ];
      // console.log();
      // console.log(range);
      // if (range[1] > piSlider.piMax)
      //   range = [piSlider.piMax - length, piSlider.piMax];
      // if (range[0] < piSlider.piMin)
      //   range = [piSlider.piMin, piSlider.piMin + length];
      // console.warn(range);
      const range = limitPositionRangeByTrack(
        moveRatio,
        piSlider.piStep,
        piSlider.piModel.value as number[],
        piSlider.piMin,
        piSlider.piMax
      );
      const piModel = rangeHandleModel(range);
      return { ...piSlider, piModel };
    },
    controlTrackByKB: (event: KeyboardEvent, piSlider: PiSlider) => {
      const reverseUnit = !piSlider.piReverse ? 1 : -1;
      const unit = piSlider.piStep;
      const value = ['ArrowRight', 'ArrowUp'].includes(event.code)
        ? unit * reverseUnit
        : -1 * unit * reverseUnit;
      let range = [
        piSlider.piModel.value[0] + value,
        piSlider.piModel.value[1] + value,
      ];
      const length = piSlider.piModel.value[1] - piSlider.piModel.value[0];

      if (range[1] > piSlider.piMax)
        range = [piSlider.piMax - length, piSlider.piMax];
      if (range[0] < piSlider.piMin)
        range = [piSlider.piMin, piSlider.piMin + length];
      const piModel = rangeHandleModel(range);
      return { ...piSlider, piModel };
    },
  };
  return piSlider;
}

export function createRangeHandleWithDataType(
  newValue: number,
  data: HandleDataType
): PiModelWithMatcher {
  if (data.type === 'single') throw Error('cannot do get ');
  const originModel =
    data.type === 'min' ? data.originModel[1] : data.originModel[0];
  const values = [
    Math.min(newValue, originModel),
    Math.max(newValue, originModel),
  ];
  return rangeHandleModel(values);
}
export function limitValueByBase(
  value: number,
  piMin: number,
  piLengthBase: PiLengthBaseType
) {
  console.log(value);
  return (
    Math.max(Math.round(value / piLengthBase.base), piLengthBase.minMul) *
      piLengthBase.base +
    piMin
  );
}
function limitRangeHandleWithBase(
  e: PiModelWithMatcher,
  newValue: number,
  data: HandleDataType,
  piLengthBase: PiLengthBaseType,
  piMin: number,
  piMax: number
) {
  const range = limitPositionRangeByHandle(
    data.type as 'min' | 'max',
    newValue,
    piLengthBase,
    piMin,
    piMax,
    e.value as number[]
  );
  return rangeHandleModel(range);
}
export function dragHandleByKBMatcher(
  newValue: number,
  data: HandleDataType
): PiModelVisitor<PiModelWithMatcher> {
  return {
    singleHandleModel(_e: PiModelWithMatcher) {
      return singleHandleModel(newValue);
    },
    rangeHandleModel(_e: PiModelWithMatcher) {
      return createRangeHandleWithDataType(newValue, data);
    },
  };
}
export function clickRailDotMatcher(
  newValue: number,
  piSlider: PiSlider,
  data?: HandleDataType
): PiModelVisitor<PiModelWithMatcher> {
  return {
    singleHandleModel(_e: PiModelWithMatcher) {
      if (!data) throw Error('cannot be single');
      return singleHandleModel(newValue);
    },
    rangeHandleModel(_e: PiModelWithMatcher) {
      if (!data) {
        const piModel = (piSlider.piModel.value as number[]).sort(
          (a, b) => a - b
        );
        if (piModel.includes(newValue)) return rangeHandleModel(piModel);
        const center = Math.abs(piModel[1] - piModel[0]) / 2 + piModel[0];
        return rangeHandleModel(
          newValue < center ? [newValue, piModel[1]] : [piModel[0], newValue]
        );
      }
      return createRangeHandleWithDataType(newValue, data);
    },
  };
}
export function freeClickWithBaseMatcher(
  newValue: number,
  piMin: number,
  piLengthBase: PiLengthBaseType
) {
  return {
    singleHandleModel(_e: PiModelWithMatcher) {
      const newLength =
        Math.max(
          Math.round((newValue - piMin) / piLengthBase.base),
          piLengthBase.minMul
        ) * piLengthBase.base;
      console.log(newLength);
      return singleHandleModel(newLength + piMin);
    },
    rangeHandleModel(e: PiModelWithMatcher) {
      // const
      return e; //TODO:还没想好交互
    },
  };
}
export function dragHandleWithBaseMatcher(
  newValue: number,
  piMin: number,
  piMax: number,
  piLengthBase: PiLengthBaseType,
  data: HandleDataType
) {
  return {
    singleHandleModel(_e: PiModelWithMatcher) {
      const newLength = newValue - piMin;
      // const minLength = piLengthBase.minMul * piLengthBase.base;
      // if (newLength < minLength) return singleHandleModel(piMin + minLength);
      const res = limitValueByBase(newLength, piMin, piLengthBase);
      return singleHandleModel(res);
    },
    rangeHandleModel(e: PiModelWithMatcher) {
      // const
      console.log('debug base...', newValue, piLengthBase, data);
      return limitRangeHandleWithBase(
        e,
        newValue,
        data,
        piLengthBase,
        piMin,
        piMax
      );
    },
  };
}
export function controlByKBWithBaseMatcher(
  newValue: number,
  data: HandleDataType,
  piMin: number,
  piMax: number,
  piLengthBase: PiLengthBaseType
) {
  console.log(newValue);
  return {
    singleHandleModel(_e: PiModelWithMatcher) {
      const newLength = newValue - piMin;
      const minLength = piLengthBase.base * piLengthBase.minMul;
      if (newLength < minLength) return singleHandleModel(piMin + minLength);
      const res =
        newLength % piLengthBase.base === 0
          ? newValue
          : limitValueByBase(newLength, piMin, piLengthBase);
      return singleHandleModel(res);
    },
    rangeHandleModel(e: PiModelWithMatcher) {
      // const

      return limitRangeHandleWithBase(
        e,
        newValue,
        data,
        piLengthBase,
        piMin,
        piMax
      );
    },
  };
}
export function createTrackAndHandleMatcher( //生成track和handle的样式  用于页面渲染
  piMin: number,
  piMax: number,
  piVertical: boolean,
  position: string,
  caculateHandleIfValid: (value: number) => object,
  caculateTransformForHandle: () => string
) {
  function trackTemplate(widthRatio: number, positionRatio: number) {
    return {
      [piVertical ? 'height' : 'width']: widthRatio + '%',
      [position]: positionRatio + '%',
    };
  }
  function handleTemplate(value: number, type: string, positionRatio: number) {
    return {
      value,
      type,
      style: {
        [position]: positionRatio + '%',
        ...caculateHandleIfValid(value as number),
        transform: caculateTransformForHandle(),
      },
    };
  }
  function valueRatio(value: number, piMin: number, piMax: number) {
    const diff = Math.abs(piMax - piMin);
    return (Math.abs(value - Math.min(piMin, piMax)) / diff) * 100;
  }
  return {
    singleHandleModel(e: PiModelWithMatcher) {
      const value = e.value as number;
      const widthRatio = valueRatio(value as number, piMin, piMax);
      return {
        track: trackTemplate(widthRatio, 0),
        handle: [handleTemplate(value, 'single', widthRatio)],
      };
    },
    rangeHandleModel(e: PiModelWithMatcher) {
      const model = e.value as number[];
      const diff = Math.abs(piMax - piMin);
      const widthRatio = ((model[1] - model[0]) / diff) * 100;
      const minRatio = ((model[0] - piMin) / diff) * 100;
      return {
        track: trackTemplate(widthRatio, minRatio),
        handle: [
          handleTemplate(model[0], 'min', minRatio),
          handleTemplate(model[1], 'max', minRatio + widthRatio),
        ],
      };
    },
  };
}
