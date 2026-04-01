import { SCENES } from '../data/scenes'

interface SceneStripProps {
  selectedIndex: number
  onChange: (index: number) => void
}

export function SceneStrip({ selectedIndex, onChange }: SceneStripProps) {
  return (
    <div className="scene-strip">
      <span className="scene-strip__label">Scene:</span>
      {SCENES.map((scene, i) => (
        <button
          key={scene.id}
          className={`scene-strip__thumb ${i === selectedIndex ? 'scene-strip__thumb--active' : ''}`}
          onClick={() => onChange(i)}
          title={scene.name}
        >
          <img src={scene.src} alt={scene.name} />
        </button>
      ))}
    </div>
  )
}
