import axios from 'axios'
import type Person from './models/Person'

export function getFullImageUrl(path: string): string {
  const baseURL = axios.defaults.baseURL;
  return `${baseURL}${path}`;
}

export function getPersonImageUrl(person: Person, defaultImageAssetPath:string): string {
    if(person && person.profileImage) {
      console.log('using profile image of person id: ' + person.id)
      return getFullImageUrl('/people/'+person.id+'/profile_image')
    } else {
      console.log('using default profile image')
      return new URL(defaultImageAssetPath, import.meta.url).href
    }
}

export default getPersonImageUrl;
