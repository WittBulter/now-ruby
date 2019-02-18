const path = require('path')
const execa = require('execa')
const { readFile, writeFile } = require('fs.promised')
const getWritableDirectory = require('@now/build-utils/fs/get-writable-directory.js')// eslint-disable-line import/no-extraneous-dependencies
const download = require('@now/build-utils/fs/download.js') // eslint-disable-line import/no-extraneous-dependencies
const { createLambda } = require('@now/build-utils/lambda.js') // eslint-disable-line import/no-extraneous-dependencies
const glob = require('@now/build-utils/fs/glob.js') // eslint-disable-line import/no-extraneous-dependencies


exports.config = {
  maxLambdaSize: '5mb',
}

exports.build = async({ files, entrypoint }) => {
  console.log('downloading files...')
  const srcDir = await getWritableDirectory()
  await download(files, srcDir)
  
  try {
    await execa('yum', ['update'], { stdio: 'inherit' })
    await execa('yum', ['install', 'ruby', '-y'], { stdio: 'inherit' })
    await execa('ruby', ['-v'], { stdio: 'inherit' })
    console.log('ruby ready.')
  } catch (err) {
    console.log('could not install ruby.')
    throw err
  }
  
  console.log('entrypoint is', entrypoint)
  const originalNowHandlerRubyContents = await readFile(
    path.join(__dirname, 'now_handler.rb'),
    'utf8',
  )
  const userHandlerFilePath = entrypoint
    .replace(/\//g, '.')
    .replace(/\.rb$/, '')
  const nowHandlerRubyContents = originalNowHandlerRubyContents.replace(
    '__NOW_HANDLER_FILENAME',
    userHandlerFilePath,
  )
  
  const nowHandlerRubyFilename = 'now__handler__ruby'
  await writeFile(
    path.join(srcDir, `${nowHandlerRubyFilename}.rb`),
    nowHandlerRubyContents,
  )
  
  const lambda = await createLambda({
    files: await glob('**', srcDir),
    handler: `${nowHandlerRubyFilename}.now_handler`,
    runtime: 'ruby',
    environment: {},
  })
  
  return {
    [entrypoint]: lambda,
  }
}
