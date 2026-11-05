import { Model } from 'pinia-orm'
import { Attr } from 'pinia-orm/decorators'
import type Person from "@/models/Person";
import type EntityImage from "@/models/EntityImage";
import type Address from "@/models/Address";

//household representing a list of people with a leader
export default class Household extends Model {
  static entity = 'household'

  @Attr(null) id!: number | null
  @Attr(null) leader!: Person | null
  @Attr(null) householdImage!: EntityImage | null
  @Attr(null) address!: Address | null
  //list of family members
  @Attr(null) people!: Person[] | null

}