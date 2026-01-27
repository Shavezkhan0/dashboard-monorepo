export interface WidgetLayout {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type WidgetType =
  | 'line'
  | 'pie'
  | 'bar'
  | 'histogram'
  | 'areachart'
  | 'donut'
  | 'funnel'
  | 'scatter'
  | 'gauge'
  | 'treemap'
  | 'bubble'
  | 'waterfall';

export interface Widget {
  id: string;
  type: WidgetType;
  props: Record<string, any>;
  layout: WidgetLayout;
}
