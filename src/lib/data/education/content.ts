import type { ToolEducationSkeleton } from './types'
import { DOF_CALCULATOR_SKELETON } from './content-dof'
import { EXPOSURE_SIMULATOR_SKELETON } from './content-exposure'
import { STAR_TRAIL_SKELETON, ND_FILTER_SKELETON, WHITE_BALANCE_SKELETON } from './content-star-nd-wb'
import { SHUTTER_SPEED_SKELETON, PERSPECTIVE_COMPRESSION_SKELETON } from './content-shutter-compression'
import { FOCUS_STACKING_SKELETON } from './content-focus-stacking'
import { EQUIVALENT_SETTINGS_SKELETON } from './content-equivalent-settings'

export const TOOL_EDUCATION_SKELETONS: ToolEducationSkeleton[] = [
  DOF_CALCULATOR_SKELETON,
  EXPOSURE_SIMULATOR_SKELETON,
  STAR_TRAIL_SKELETON,
  ND_FILTER_SKELETON,
  WHITE_BALANCE_SKELETON,
  SHUTTER_SPEED_SKELETON,
  PERSPECTIVE_COMPRESSION_SKELETON,
  FOCUS_STACKING_SKELETON,
  EQUIVALENT_SETTINGS_SKELETON,
]
