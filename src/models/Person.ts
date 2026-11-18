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
  @Str('') preferredName!: string | null
  @Str('') middleName!: string | null
  @Str('') title!: string | null
  @Str('') email!: string | null
  @Str('') mobileNumber!: string | null
  @Str('') dateOfBirth!: string | null
  @Str('') gender!: string | null
  @Str('') marriageDate!: string | null
  @Str('') maritalStatus!: string | null
  @Str('') registeredDate!: string | null
  @Str('') lifecycleStatus!: string | null
  @Str('') membershipStatus!: string | null
  @Str('') memberSince!: string | null
  @Str('') baptismStatus!: string | null
  @Str('') baptismDate!: string | null
  @Str('') baptismLocation!: string | null
  @Str('') ministryInvolvement!: string | null
  @Str('') occupation!: string | null
  @Str('') biography!: string | null
  @Str('') pastoralNotes!: string | null
  @Attr([]) emergencyContacts!: { id?: number; name: string; relationshipLabel?: string | null; phone?: string | null; email?: string | null }[]
  @Attr([]) emails!: { id?: number; email: string; isPrimary?: boolean; label?: string | null }[]
  @Attr([]) phones!: { id?: number; number: string; phoneType?: string; isPrimary?: boolean }[]
  @Attr([]) categories!: { id: number; name: string; colour?: string | null }[]
  @Attr([]) customFields!: { fieldId: number; name: string; fieldType: string; value: unknown }[]
  @Attr([]) relationships!: { id?: number; relationshipType?: string; direction?: string; relatedFirstName?: string | null; relatedLastName?: string | null; relatedPersonId?: number }[]
  @Attr([]) groups!: { groupId: number; groupName: string; role?: string | null; status?: string | null; category?: string | null }[]
  @Attr([]) socialMediaLinks!: { type?: string; url: string }[]
  @Attr([]) addresses!: Address[] | []
  @Attr([]) households!: Household[] | []
  @Attr(null) profileImage!: EntityImage | null
  @Str('') externalImageUrl!: string | null


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
    return `${this.firstName} ${this.lastName}`.trim()
  }

  get displayName() {
    const first = this.preferredName || this.firstName
    return [first, this.lastName].filter(Boolean).join(' ')
  }
}
