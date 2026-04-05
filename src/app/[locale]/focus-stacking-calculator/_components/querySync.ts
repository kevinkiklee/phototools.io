import { intParam, numParam, sensorParam } from '@/lib/utils/querySync'

export const PARAM_SCHEMA = {
  fl: intParam(50, 8, 800),
  f: numParam(8, 1, 64),
  s: sensorParam('ff'),
  near: numParam(0.5, 0.1, 100),
  far: numParam(5, 0.1, 100),
  overlap: intParam(20, 10, 50),
}
