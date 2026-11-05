import axios from 'axios'

type ImageRef = { id?: number | string | null } | null | undefined

export function getFullImageUrl(path: string): string {
  const baseURL = axios.defaults.baseURL;
  return `${baseURL}${path}`;
}

export function getPersonImageUrl(person: { profileImage?: ImageRef } | null | undefined): string {
    if(person && person.profileImage) {
      return getFullImageUrl('/images/'+person.profileImage.id)
    } else {
      return "";
    }
}

export function getHouseholdImageUrl(household: { householdImage?: ImageRef } | null | undefined): string {
  if(household && household.householdImage) {
    return getFullImageUrl('/images/'+household.householdImage.id)
  } else {
    return "";
  }
}

export default getPersonImageUrl;
