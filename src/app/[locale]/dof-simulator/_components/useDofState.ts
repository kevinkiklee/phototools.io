'use client'

import { useState, useMemo } from 'react'
import {
  calcDoF, calcBackgroundBlur, calcAiryDisk,
  calcOptimalAperture, calcIsolationScore,
} from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import {
  getDofScene,
  type SubjectMode, type ABMode, type BokehShape,
} from '@/lib/data/dofSimulator'
import { useQueryInit, useToolQuerySync } from '@/lib/utils/querySync'
import { PARAM_SCHEMA } from './querySync'

export function useDofState() {
  // ── Camera settings (A set) ──
  const [focalLength, setFocalLength] = useState(85)
  const [aperture, setAperture] = useState(2.8)
  const [subjectDistance, setSubjectDistance] = useState(3)
  const [sensorId, setSensorId] = useState('ff')
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  // ── Scene & modes ──
  const [sceneKey, setSceneKey] = useState('park-portrait')
  const [subjectMode, setSubjectMode] = useState<SubjectMode>('figure')
  const [abMode, setAbMode] = useState<ABMode>('off')
  const [bokehShape, setBokehShape] = useState<BokehShape>('disc')
  const [useDiffraction, setUseDiffraction] = useState(false)

  // ── A/B settings (B set) ──
  const [bFocalLength, setBFocalLength] = useState(50)
  const [bAperture, setBAperture] = useState(5.6)
  const [bSubjectDistance, setBSubjectDistance] = useState(3)
  const [bSensorId, setBSensorId] = useState('ff')

  // ── A/B state ──
  const [activeSet, setActiveSet] = useState<'a' | 'b'>('a')
  const [dividerPos, setDividerPos] = useState(0.5)

  // ── Framing ──
  const [activeFramingPreset, setActiveFramingPreset] = useState<string | null>(null)
  const [framingLockMode, setFramingLockMode] = useState<'constantFL' | 'constantDistance'>('constantFL')

  // ── Query sync ──
  useQueryInit(PARAM_SCHEMA, {
    fl: setFocalLength, f: setAperture, d: setSubjectDistance,
    s: setSensorId, scene: setSceneKey, mode: setSubjectMode,
    orient: setOrientation, bokeh: setBokehShape, ab: setAbMode,
    b_fl: setBFocalLength, b_f: setBAperture,
    b_d: setBSubjectDistance, b_s: setBSensorId,
  })
  useToolQuerySync({
    fl: focalLength, f: aperture, d: subjectDistance,
    s: sensorId, scene: sceneKey, mode: subjectMode,
    orient: orientation, bokeh: bokehShape, ab: abMode,
    b_fl: bFocalLength, b_f: bAperture,
    b_d: bSubjectDistance, b_s: bSensorId,
  }, PARAM_SCHEMA)

  // ── Computed: sensor A ──
  const sensor = SENSORS.find((sen) => sen.id === sensorId) ?? SENSORS[3]
  const sensorWidth = (orientation === 'landscape' ? sensor.w : sensor.h) ?? 36
  const sensorHeight = (orientation === 'landscape' ? sensor.h : sensor.w) ?? 24
  const coc = 0.03 / sensor.cropFactor
  const scene = getDofScene(sceneKey)

  // ── Computed: sensor B ──
  const bSensor = SENSORS.find((sen) => sen.id === bSensorId) ?? SENSORS[3]
  const bSensorWidth = (orientation === 'landscape' ? bSensor.w : bSensor.h) ?? 36

  // ── Computed: DoF results (A) ──
  const dofResult = useMemo(
    () => calcDoF({ focalLength, aperture, distance: subjectDistance, coc }),
    [focalLength, aperture, subjectDistance, coc],
  )

  const backgroundBlurMm = useMemo(
    () => calcBackgroundBlur({ focalLength, aperture, subjectDistance, targetDistance: scene.farDistance }),
    [focalLength, aperture, subjectDistance, scene.farDistance],
  )

  const backgroundBlurPct = (backgroundBlurMm / sensorWidth) * 100

  const isolationScore = useMemo(
    () => calcIsolationScore(backgroundBlurMm, coc),
    [backgroundBlurMm, coc],
  )

  const sweetSpot = useMemo(
    () => calcOptimalAperture(focalLength, subjectDistance, scene.farDistance),
    [focalLength, subjectDistance, scene.farDistance],
  )

  const isDiffractionLimited = calcAiryDisk(aperture) > backgroundBlurMm

  // ── Prop bundles ──
  const settingsProps = {
    focalLength, aperture, subjectDistance, sensorId,
    orientation, sweetSpot,
    onFocalLengthChange: setFocalLength, onApertureChange: setAperture,
    onDistanceChange: setSubjectDistance, onSensorChange: setSensorId,
    onOrientationChange: setOrientation,
  }

  const resultsProps = {
    nearFocus: dofResult.nearFocus, farFocus: dofResult.farFocus,
    totalDoF: dofResult.totalDoF, hyperfocal: dofResult.hyperfocal,
    backgroundBlurMm, backgroundBlurPct, coc,
    isolationScore, isDiffractionLimited,
  }

  const abSetOptions = [
    { value: 'a' as const, label: 'A' },
    { value: 'b' as const, label: 'B' },
  ]

  const isInFocus = subjectDistance >= dofResult.nearFocus && subjectDistance <= dofResult.farFocus

  return {
    // Camera settings A
    focalLength, aperture, subjectDistance, sensorId, sensorWidth, sensorHeight, coc,
    // Scene & modes
    scene, sceneKey, setSceneKey, subjectMode, setSubjectMode,
    abMode, setAbMode, bokehShape, setBokehShape,
    useDiffraction, setUseDiffraction,
    // A/B settings B
    bFocalLength, setBAperture, bAperture, setBFocalLength,
    bSubjectDistance, setBSubjectDistance, bSensorId, setBSensorId, bSensorWidth,
    // A/B state
    activeSet, setActiveSet, dividerPos, setDividerPos,
    // Framing
    activeFramingPreset, setActiveFramingPreset,
    framingLockMode, setFramingLockMode,
    // Orientation
    orientation, setOrientation,
    // DoF results
    dofResult, backgroundBlurPct,
    setSubjectDistance,
    // Prop bundles
    settingsProps, resultsProps,
    // Constants
    abSetOptions, isInFocus,
  }
}
