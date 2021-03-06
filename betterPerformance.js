'use strict'

const betterSqlite = require('./betterSqlite')

async function testBetterSqlitePerformance (nums, transParams) {
  // const nums = new Array(999).fill().map((v, i) => i) // 999
  // const transParams = new Array(1000000).fill()
  //   .map((v, number) => ({ number }))
  await betterSqlite.startBetterSqlLite()
  await betterSqlite.setPragma()
  await betterSqlite.resetBetterSqlTable()
  const oneByOneTakes = await testInsertOneByOne(nums)
  console.log('oneByOneTakes: ', oneByOneTakes)
  await betterSqlite.resetBetterSqlTable()
  const parallelTakes = await testInsertParallel(nums)
  console.log('parallelTakes: ', parallelTakes)
  await betterSqlite.resetBetterSqlTable()
  const instArrTakes = await testInsertArray(nums)
  console.log('instArrTakes: ', instArrTakes)
  for (let i = 0; i < 999; i++) {
    await testInsertArray(nums)
  }
  const findTakes = await testFind()
  console.log('findTakes: ', findTakes)
  // Inserting the hole array at once is similar to performing just one insert.
  // Parallel seems slower than synchronous

  const instArrByTransTakes = await testInsertArrayByTrans(transParams)
  console.log('instArrByTransTakes: ', instArrByTransTakes)

  return {
    oneByOneTakes,
    parallelTakes,
    instArrTakes,
    findTakes,
    instArrByTransTakes
  }
}

async function testInsertOneByOne (nums) {
  const start = Date.now()
  for (const num of nums) {
    await betterSqlite.insertNum(num)
  }
  const end = Date.now()
  return end - start
}

async function testInsertParallel (nums) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    Promise.all(
      nums.map(num => betterSqlite.insertNum(num))
    ).then((values) => {
      const end = Date.now()
      resolve(end - start)
    })
  })
}

async function testInsertArray (nums) {
  if (nums.length > 999) throw new Error('Arr cant be bigger than 999')
  const start = Date.now()
  await betterSqlite.insertManyNums(nums)
  const end = Date.now()
  return end - start
}

async function testInsertArrayByTrans (params) {
  const start = Date.now()
  await betterSqlite.insertManyNumsByTrans(params)
  const end = Date.now()
  return end - start
}

async function testFind () {
  const start = Date.now()
  const res = await betterSqlite.findVals([1])
  const end = Date.now()
  if (res.length !== 1000) console.log('Error in res: ', res.length)
  return end - start
}

module.exports = {
  testBetterSqlitePerformance
}
