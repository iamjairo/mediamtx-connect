import type { PathConf } from '@/lib/MediaMTX/generated'

import { z } from 'zod'

export const PathConfigSchema = z.object({
  name: z.string().optional(),
  source: z.string().optional(),
  sourceFingerprint: z.string().optional(),
  sourceOnDemand: z.boolean().optional(),
  sourceOnDemandStartTimeout: z.string().optional(),
  sourceOnDemandCloseAfter: z.string().optional(),
  maxReaders: z.coerce.number().optional(),
  srtReadPassphrase: z.string().optional(),
  record: z.boolean().optional(),
  publishUser: z.string().optional(),
  publishPass: z.string().optional(),
  publishIPs: z.array(z.string()).optional(),
  readUser: z.string().optional(),
  readPass: z.string().optional(),
  readIPs: z.array(z.string()).optional(),
  overridePublisher: z.boolean().optional(),
  fallback: z.string().optional(),
  srtPublishPassphrase: z.string().optional(),
  rtspTransport: z.string().optional(),
  rtspAnyPort: z.boolean().optional(),
  rtspRangeType: z.string().optional(),
  rtspRangeStart: z.string().optional(),
  sourceRedirect: z.string().optional(),
  runOnInit: z.string().optional(),
  runOnInitRestart: z.boolean().optional(),
  runOnDemand: z.string().optional(),
  runOnDemandRestart: z.boolean().optional(),
  runOnDemandStartTimeout: z.string().optional(),
  runOnDemandCloseAfter: z.string().optional(),
  runOnUnDemand: z.string().optional(),
  runOnReady: z.string().optional(),
  runOnReadyRestart: z.boolean().optional(),
  runOnNotReady: z.string().optional(),
  runOnRead: z.string().optional(),
  runOnReadRestart: z.boolean().optional(),
  runOnUnread: z.string().optional(),
  runOnRecordSegmentCreate: z.string().optional(),
  runOnRecordSegmentComplete: z.string().optional(),
}) satisfies z.ZodType<Omit<PathConf, | 'rpiCameraCamID'
| 'rpiCameraWidth'
| 'rpiCameraHeight'
| 'rpiCameraHFlip'
| 'rpiCameraVFlip'
| 'rpiCameraBrightness'
| 'rpiCameraContrast'
| 'rpiCameraSaturation'
| 'rpiCameraSharpness'
| 'rpiCameraExposure'
| 'rpiCameraAWB'
| 'rpiCameraDenoise'
| 'rpiCameraShutter'
| 'rpiCameraMetering'
| 'rpiCameraGain'
| 'rpiCameraEV'
| 'rpiCameraROI'
| 'rpiCameraHDR'
| 'rpiCameraTuningFile'
| 'rpiCameraMode'
| 'rpiCameraFPS'
| 'rpiCameraIDRPeriod'
| 'rpiCameraBitrate'
| 'rpiCameraProfile'
| 'rpiCameraLevel'
| 'rpiCameraAfMode'
| 'rpiCameraAfRange'
| 'rpiCameraAfSpeed'
| 'rpiCameraLensPosition'
| 'rpiCameraAfWindow'
| 'rpiCameraTextOverlayEnable'
| 'rpiCameraTextOverlay'>>

export type PathConfigFormData = z.infer<typeof PathConfigSchema>
