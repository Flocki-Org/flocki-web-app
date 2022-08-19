import { Model, Attr, Str } from 'pinia-orm'

export default class User extends Model {
    static entity = 'users'

    @Attr(null)
    id!: number | null

    @Str('')
    first_name!: string

    @Str('')
    last_name!: string

    @Str('')
    email!: string
}