import { Model } from 'pinia-orm'
import { Attr, Str } from 'pinia-orm/dist/decorators'

export default class User extends Model {
  static entity = 'users'

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