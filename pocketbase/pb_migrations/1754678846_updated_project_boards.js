/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3282162638")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json2102626174",
    "maxSize": 0,
    "name": "columns",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3282162638")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json2102626174",
    "maxSize": 0,
    "name": "column",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
