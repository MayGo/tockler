// source: https://github.com/voodoocreation/ts-deepmerge/blob/master/src/index.ts
interface IObject {
  [key: string]: any
}

type TUnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

// istanbul ignore next
const isObject = (obj: any) => {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      const prototype = Object.getPrototypeOf(obj)
      return prototype === Object.prototype || prototype === null
    }

    return Object.prototype.toString.call(obj) === '[object Object]'
  }

  return false
}

const merge = <T extends IObject[]>(...objects: T): TUnionToIntersection<T[number]> =>
  objects.reduce((result, current) => {
    Object.keys(current).forEach(key => {
      if (Array.isArray(result[key]) && Array.isArray(current[key])) {
        result[key] = Array.from(new Set(result[key].concat(current[key])))
      } else if (isObject(result[key]) && isObject(current[key])) {
        result[key] = merge(result[key], current[key])
      } else {
        result[key] = current[key]
      }
    })

    return result
  }, {}) as any

export default merge
