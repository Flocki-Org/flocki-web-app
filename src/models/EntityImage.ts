import { Model } from 'pinia-orm'
import { Attr, Str } from 'pinia-orm/decorators'

export default class EntityImage extends Model {
  static entity = 'entityImage'

  @Attr(null) id!: number | null
  @Str('') description!: string
  @Str('') tags!: string
  @Str('') created!: string
}