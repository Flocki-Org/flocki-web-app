import { createPinia, setActivePinia } from 'pinia'
import { createORM, useRepo } from 'pinia-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import Person from './Person'

describe('Person model', () => {
  beforeEach(() => {
    const pinia = createPinia().use(createORM())
    setActivePinia(pinia)
  })

  it('stores a person and builds the display name', () => {
    const person = useRepo(Person).save({
      id: 1,
      firstName: 'Ada',
      lastName: 'Lovelace',
      gender: 'female',
    })

    expect(person?.fullName).toBe('Ada Lovelace')
    expect(person?.gender).toBe('Female')
  })
})
