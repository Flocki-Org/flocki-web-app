import { Model } from 'pinia-orm'
import { Attr, Num, Str } from 'pinia-orm/decorators'

export default class Address extends Model {
    static entity = 'addresses'

    @Attr(null) id!: number | null
    @Str('') type!: string
    @Str('') streetNumber!: string
    @Str('') street!: string
    @Str('') suburb!: string
    @Str('') city!: string
    @Str('') province!: string
    @Str('') country!: string
    @Str('') postalCode!: string
    @Num(null) latitude!: number | null
    @Num(null) longitude!: number | null
}
