export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'landscape', name: 'Landscape', src: '/images/scenes/landscape-boat-lake.jpg' },
  { id: 'portrait', name: 'Portrait', src: '/images/scenes/portrait-woman.jpg' },
  { id: 'wildlife', name: 'Wildlife', src: '/images/scenes/wildlife-condor.jpg' },
  { id: 'city', name: 'City Street', src: '/images/scenes/city-street.jpg' },
  { id: 'milkyway', name: 'Milky Way', src: '/images/scenes/milky-way-night-sky.jpg' },
]
