import landscape from '../assets/landscape.jpg'
import person from '../assets/person.jpg'
import wildlife from '../assets/wildlife.jpg'
import city from '../assets/city.jpg'
import milkyway from '../assets/milkyway.jpg'

export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'landscape', name: 'Landscape', src: landscape },
  { id: 'person', name: 'Person', src: person },
  { id: 'wildlife', name: 'Wildlife', src: wildlife },
  { id: 'city', name: 'City Street', src: city },
  { id: 'milkyway', name: 'Milky Way', src: milkyway },
]
