/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2257284400")

  // update collection data
  unmarshal({
    "name": "types"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2257284400")

  // update collection data
  unmarshal({
    "name": "account_types"
  }, collection)

  return app.save(collection)
})
