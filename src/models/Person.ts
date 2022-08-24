import { Model, Attr, Str } from 'pinia-orm'

export default class Person extends Model {
  static entity = 'people'

  @Attr(null)
  id!: number | null

  @Str('')
  firstName!: string

  @Str('')
  lastName!: string

  @Str('')
  email!: string

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}