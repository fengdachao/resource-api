const express = require('express')
const archiver = require('archiver')
const { ObjectId } = require('mongodb')
const uuid = require('uuid').v4
const router = express.Router();
const http = require('node:http')
const fs = require('node:fs')
const db = require('../db')()

router.get('/list', async function (req, res) {
  const { query: { name, place, cameraId, startDate, endDate } } = req
  const params = {
    // name,
    // place,
    // cameraId,
    date: {$gte: Number(startDate), $lte: Number(endDate)},
  }
  if (name) params.name = name
  if (place) {
    params.place = {
      $eq: place,
    }
  }
  if (cameraId) params.cameraId = cameraId
  console.log('params:', params)
  const data = await db.find(params, 'list')
  console.log('data:', data)
  res.json({ data })
})

router.post('/add', async function (req, res) {
  const payload = req.body
  console.log('req:', payload)
  const doc = {
    ...payload,
    id: uuid(),
    timestamp: new Date().getTime()
  }
  const result = await db.insertOne(doc, 'list')
  res.json({result})
})

router.delete('/remove', async function (req, res) {
  console.log('req:', req)
  const id = req.body.id
  const path = req.body.path
  const result = await db.deleteOne(id, 'list')
  res.json({ result })
  // console.log('recv path:', path)
  // delete file
  // fs.rm(path, (err) => {
  //   if (err) {
  //     console.log('error:', err)
  //     return res.status(500).json({ message: 'remove file fail,' + path})
  //   }
  //   res.json({ result })
  // })
})

router.delete('/list/remove', async function(req, res) {
  console.log('list remove:', req.body)
  const deleteParam = { _id: { $in: req.body.map((id) => ObjectId(id))}}
  const result = await db.remove(deleteParam, 'list')
  return res.json({ result })
})

router.post('/list/batch-download', async function(req, res) {
  const files = req.body
  let fileNameThunk = ''
  const batchRequest = http.request({
    hostname: 'localhost',
    port: 6666,
    method: 'POST',
    path: '/',
  }, (batchResponse) => {
    // console.log('res from batch server:', res)
    batchResponse.on('data', (chunk) => {
      console.log(`receive data from batch server:${chunk}`)
      fileNameThunk += chunk
    })
    batchResponse.on('end', () => {
      res.end(fileNameThunk)
      console.log('batch server is end')
    })
  })
  batchRequest.write(JSON.stringify(files))
  batchRequest.end()
  // res.end()
})

router.get('/config/list', async function (req, res) {
  const list = await db.find({}, 'config')
  return res.json(list)
})

router.get('/config/one', async function (req, res) {
  const result = await db.findOne({id: req.query.id}, 'config')
  return res.json(result)
})

router.post('/config/add', async function(req, res) {
  const newConfig = req.body
  const result = await db.insertOne(newConfig, 'config')
  res.json(result)
})

router.put('/config/update', async function(req, res) {
  console.log('update config:', req.body)
  const result = await db.updateOne({ id: req.body.id }, req.body, 'config')
  res.json(result)
})

router.delete('/config/remove', async function(req, res) {
  console.log(req.query.id)
  const result = await db.deleteOne(req.query.id, 'config')
  res.json(result)
})

router.get('/config/param', async function (req, res) {
  const result = await db.find({}, 'param')
  res.json(result[0])
})

router.put('/config/param/update', async function (req, res) {
  console.log('update param:', req.body)
  const result = await db.updateOne({ id: req.body.id }, req.body, 'param')
})

router.get('/user/list', async function(req, res) {
  const result = await db.find({}, 'user')
  res.json(result)
})

router.get('/user/one', async function(req, res) {
  console.log('find one user:', ObjectId(req.query.id))
  const result = await db.findOne({ _id: ObjectId(req.query.id) }, 'user')
  res.json(result)
})

router.post('/user/validate', async function(req, res) {
  const { name, password } = req.body
  if (name) {
    const user = await db.findOne({ name }, 'user')
    const validate = user && user.password === password
    res.cookie('isAuth', validate, {
      domain: '*',
      expires: new Date(Date.now() + 24 * 3600000)
    })
    // .set('Access-Control-Allow-Origin', '*')
    // .set('Access-Control-Allow-Credentials', true)
    .json({ validate: validate ? 'success' : 'fail', role: user.role })
  } else res.json({ validate: 'fail' })
})

router.post('/user/add', async function(req, res) {
  const result = await db.insertOne(req.body, 'user')
  res.json(result)
})

router.put('/user/update', async function(req, res) {
  const result = await db.updateOne({ _id: ObjectId(req.body.id) }, req.body, 'user')
  res.json(result)
})

router.delete('/user/delete', async function(req, res) {
  const result = await db.deleteByParam({ _id: ObjectId(req.query.id) }, 'user')
  res.json(result)
})

module.exports = router
