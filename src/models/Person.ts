import { Model } from 'pinia-orm'
import { Attr, Str } from 'pinia-orm/decorators'
import type EntityImage from './EntityImage'
import type Household from "@/models/Household";
import type Address from "@/models/Address";

export default class Person extends Model {
  static entity = 'people'

  @Attr(null) id!: number | null
  @Str('') firstName!: string
  @Str('') lastName!: string
  @Str('') email!: string | null
  @Str('') mobileNumber!: string | null
  @Str('') dateOfBirth!: string | null
  @Str('') gender!: string | null
  @Str('') marriageDate!: string | null
  @Str('') maritalStatus!: string | null
  @Str('') registeredDate!: string | null
  @Attr([]) addresses!: Address[] | []
  @Attr([]) households!: Household[] | []
  @Attr(null) profileImage!: EntityImage | null


  static mutators() {
    return {
      gender: {
        get: (value: string | null) => value ? value.charAt(0).toUpperCase() + value.slice(1) : null
      },
      maritalStatus: {
        get: (value: string | null) => value ? value.charAt(0).toUpperCase() + value.slice(1) : null
      }
    }
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
