import { Model } from 'pinia-orm'
import { Attr, Str } from 'pinia-orm/dist/decorators'
import type EntityImage from './EntityImage'
import type Household from "@/models/Household";

export default class Person extends Model {
  static entity = 'people'

  @Attr(null) declare id: number | null
  @Str('') declare firstName: string
  @Str('') declare lastName: string
  @Str('') declare email: string | null
  @Str('') declare mobileNumber: string | null
  @Str('') declare dateOfBirth: string | null
  @Str('') declare gender: string | null
  @Str('') declare marriageDate: string | null
  @Str('') declare maritalStatus: string | null
  @Str('') declare registeredDate: string | null
  @Attr([]) declare households: Household[] | []
  @Attr(null) declare profileImage: EntityImage | null


  static mutators() {
    return {
      gender: {
        get: (value: any) => value ? value.charAt(0).toUpperCase() + value.slice(1) : null
      },
      maritalStatus: {
        get: (value: any) => value ? value.charAt(0).toUpperCase() + value.slice(1) : null
      }
    }
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }


  getPersonHousehold() {
    if(this.person && this.person.households && this.person.households[0])
      return this.person.households[0];
    else
      return null;
  }

}