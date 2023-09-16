import { Model } from 'pinia-orm'
import { Attr, Str } from 'pinia-orm/dist/decorators'

export default class EntityImage extends Model {
  static entity = 'entityImage'

  @Attr(null) declare id: number | null
  @Str('') declare description: string
  @Str('') declare tags: string
  @Str('') declare created: string
}