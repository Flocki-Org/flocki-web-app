import { Model } from 'pinia-orm'
import { Attr, Str } from 'pinia-orm/dist/decorators'
import type Person from "@/models/Person";
import type EntityImage from "@/models/EntityImage";

//household representing a list of people with a leader
export default class Household extends Model {
  static entity = 'household'

  @Attr(null) declare id: number | null
  @Attr(null) declare leader: Person | null
  @Attr(null) declare householdImage: EntityImage | null
  //list of family members
  @Attr(null) declare people: Person[] | null

}