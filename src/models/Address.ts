import { Model } from 'pinia-orm'
import { Attr, Str, Num } from 'pinia-orm/dist/decorators'

export default class Address extends Model {
    static entity = 'addresses'

    @Attr(null) declare id: number | null
    @Str('') declare type: string
    @Str('') declare street_number: string
    @Str('') declare street: string
    @Str('') declare suburb: string
    @Str('') declare city: string
    @Str('') declare province: string
    @Str('') declare country: string
    @Str('') declare postal_code: string
    @Num(null) declare latitude: number | null
    @Num(null) declare longitude: number | null
}
