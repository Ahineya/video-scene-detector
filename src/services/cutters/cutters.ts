import {HistogramCutter} from "./histogram-cutter.ts";
import {CLDCutter} from "./cld-cutter.ts";
import {ORBCpuCutter} from "./orb-cpu-cutter.ts";
import {ORBGPUCutter} from "./orb-gpu-cutter.ts";

export const histogramCutter = new HistogramCutter();
export const cldCutter = new CLDCutter();
export const orbCpuCutter = new ORBCpuCutter();
export const orbGpuCutter = new ORBGPUCutter();
