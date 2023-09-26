import axios from 'axios'
import type Person from './models/Person'
import type Household from "@/models/Household";

export function getFullImageUrl(path: string): string {
  const baseURL = axios.defaults.baseURL;
  return `${baseURL}${path}`;
}

export function getPersonImageUrl(person: Person): string {
    //console.log(person)
    if(person && person.profileImage) {
      //console.log('using profile image of person id: ' + person.id)
      return getFullImageUrl('/images/'+person.profileImage.id)
    } else {
      //console.log("person is null or doesnt have a profile image")
      return "";
    }
}

export function getHouseholdImageUrl(household: Household): string {
  //console.log('getting household image')
  if(household && household.householdImage) {
    return getFullImageUrl('/images/'+household.householdImage.id)
  } else {
    return "";
  }
}

function getBaseUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}/`;
  } catch (error) {
    console.error(`Invalid URL: ${url}`);
    return "";
  }
}

export default getPersonImageUrl;
