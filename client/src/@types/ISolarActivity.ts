export default interface ISolarActivity {
  axes: { latitude: number; longitude: number; reftime: string; time: string };
  classifiers: { reference_time: string };
  context: string;
  data: { av_swsfcdown: number };
};
