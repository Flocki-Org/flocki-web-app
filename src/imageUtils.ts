import axios from 'axios'
import type Person from './models/Person'

export function getFullImageUrl(path: string): string {
  const baseURL = axios.defaults.baseURL;
  return `${baseURL}${path}`;
}

export function getPersonImageUrl(person: Person): string {
    if(person && person.profileImage) {
      console.log('using profile image of person id: ' + person.id)
      return getFullImageUrl('/people/'+person.id+'/profile_image')
    } else {
      console.log("person is null or doesnt have a profile image")
      return "";
    }
}

function getBaseUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}/`;
  } catch (error) {
    console.error(`Invalid URL: ${url}`);
    return "";
  }
}

export default getPersonImageUrl;
