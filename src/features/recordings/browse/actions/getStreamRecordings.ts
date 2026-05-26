'use server'

import type { StreamRecording } from '../types'
import fs from 'node:fs'

import path from 'node:path'
import { getAppConfig } from '@/features/config/client'

import { logger } from '@/shared/utils'
import { getScreenshot } from './getScreenshot'

export async function getStreamRecordings({
  page = 1,
  take = 1,
  streamName,
}: {
  recordingsDirectory: string
  screenshotsDirectory: string
  page?: number
  take?: number
  streamName: string
}): Promise<StreamRecording[]> {
  const config = await getAppConfig()
  logger.debug('Getting Recordings')
  if (!config) {
    return []
  }

  const recordingsRoot = path.resolve(config.recordingsDirectory)
  const streamDir = path.resolve(recordingsRoot, streamName)
  if (
    streamDir !== recordingsRoot
    && !streamDir.startsWith(recordingsRoot + path.sep)
  ) {
    logger.warn('Rejected invalid streamName path traversal attempt', {
      streamName,
    })
    return []
  }

  const startIndex = (page - 1) * +take
  const endIndex = startIndex + +take

  const recordingFiles = fs
    .readdirSync(streamDir)
    .filter(f => !f.startsWith('.'))
    .sort((one, two) => (one > two ? -1 : 1))
    .slice(startIndex, endIndex)

  const recordingsWithTime = await Promise.all(
    recordingFiles.map(async (r) => {
      const recordingPath = path.resolve(streamDir, r)
      if (
        recordingPath !== streamDir
        && !recordingPath.startsWith(streamDir + path.sep)
      ) {
        logger.warn('Rejected invalid recording path traversal attempt', {
          streamName,
          recordingFileName: r,
        })
        return null
      }

      const stat = fs.statSync(recordingPath)
      return {
        name: r,
        createdAt: stat.mtime,
        base64: await getScreenshot({
          recordingFileName: r,
          streamName,
        }),
        fileSize: stat.size,
      }
    }),
  )

  return recordingsWithTime.filter(
    (recording): recording is StreamRecording => recording !== null,
  )
}
