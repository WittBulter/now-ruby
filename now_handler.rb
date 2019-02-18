require 'webrick'
require_relative './__NOW_HANDLER_FILENAME'

server = WEBrick::HTTPServer.new :Port => 3000
server.mount '/', Handler
trap('INT') { server.shutdown }
server.start

def now_handler (event, context)
  puts 1, event
  puts 'context'
  puts context
  {
    :statusCode => 200,
    :headers => {},
    :body => '1'
  }
end
